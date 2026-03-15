import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Linking,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import Header from '../../components/Header';
import api from '../../config/api';
import { useResponsive } from '../../utils/responsive';

const { width } = Dimensions.get('window');
const isWebPlatform = Platform.OS === 'web';

const CompanyDetailsScreen = ({ route, navigation }) => {
  const { companyId, id } = route.params || {};
  // Use companyId first, fallback to id (for route param)
  const actualCompanyId = companyId || id;
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [similarCompanies, setSimilarCompanies] = useState([]);
  
  // Responsive handling
  const responsive = useResponsive();
  const { width } = responsive;
  const isXsPhone = width <= 320;
  const isSmallPhone = width > 320 && width <= 375;
  const isPhone = width > 375 && width <= 414;
  const isMobile = width <= 480;
  const isTablet = width > 480 && width <= 834;
  const isDesktop = width > 1024;
  const dynamicStyles = useMemo(
    () => getDynamicStyles({ isXsPhone, isSmallPhone, isPhone, isMobile, isTablet, isDesktop, width }),
    [isXsPhone, isSmallPhone, isPhone, isMobile, isTablet, isDesktop, width]
  );

  useEffect(() => {
    if (actualCompanyId) {
      loadCompanyDetails();
    } else {
      console.error('No company ID provided');
      setLoading(false);
    }
  }, [actualCompanyId]);

  const loadCompanyDetails = async () => {
    if (!actualCompanyId) {
      console.error('Cannot load company details: no company ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await api.getCompany(actualCompanyId);
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
          .filter((item) => item._id !== actualCompanyId && item._id !== data._id)
          .slice(0, 4);

        // If we don't have enough similar companies, get more recent companies
        if (similarCompaniesList.length < 4) {
          const recentCompanies = await api.getCompanies({ limit: 10 });
          const additionalCompanies = (recentCompanies.companies || [])
            .filter((item) => 
              item._id !== actualCompanyId && 
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
    navigation.navigate('CompanyDetails', { companyId: similarCompanyId });
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
      <View style={S.container}>
        <Header />
        <View style={S.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={S.loadingText}>Loading company details...</Text>
        </View>
      </View>
    );
  }

  if (!company) {
    return (
      <View style={S.container}>
        <Header />
        <View style={S.errorContainer}>
          <Ionicons name="business-outline" size={80} color="#94A3B8" />
          <Text style={S.errorText}>Company not found</Text>
          <TouchableOpacity
            style={S.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={S.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const companyData = company.profile?.company || {};
  const socialProfile = companyData.socialMediaProfile;
  const socialLink = companyData.socialMediaLink;

  return (
    <View style={S.container}>
      <Header />
      <View style={dynamicStyles.contentWrapper}>
        <ScrollView
          style={S.scrollView}
          contentContainerStyle={dynamicStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#4F46E5']} tintColor="#4F46E5" />}
        >
          <View style={dynamicStyles.mainColumn}>

            {/* ── Hero Card ── */}
            <View style={S.heroCard}>
              <View style={S.heroTop}>
                <View style={[S.avatar, { backgroundColor: getAvatarColor(companyData.name) }]}>
                  <Text style={S.avatarText}>{getInitials(companyData.name)}</Text>
                </View>
                <View style={S.heroInfo}>
                  <Text style={S.companyName}>{companyData.name}</Text>
                  {companyData.companyType && (
                    <View style={S.typePill}>
                      <Text style={S.typePillText}>{companyData.companyType}</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={S.metaRow}>
                {companyData.industry && (
                  <View style={[S.metaPill, S.metaBlue]}>
                    <Ionicons name="briefcase-outline" size={13} color="#3B82F6" />
                    <Text style={[S.metaText, { color: '#3B82F6' }]}>{companyData.industry}</Text>
                  </View>
                )}
                {companyData.size && (
                  <View style={[S.metaPill, S.metaPurple]}>
                    <Ionicons name="people-outline" size={13} color="#7C3AED" />
                    <Text style={[S.metaText, { color: '#7C3AED' }]}>{companyData.size}</Text>
                  </View>
                )}
                {(companyData.establishedYear || company.profile?.company?.company?.foundedYear) && (
                  <View style={[S.metaPill, S.metaGreen]}>
                    <Ionicons name="calendar-outline" size={13} color="#059669" />
                    <Text style={[S.metaText, { color: '#059669' }]}>Est. {companyData.establishedYear || company.profile?.company?.company?.foundedYear}</Text>
                  </View>
                )}
                {(companyData.location?.city || companyData.location?.state) && (
                  <View style={[S.metaPill, S.metaAmber]}>
                    <Ionicons name="location-outline" size={13} color="#D97706" />
                    <Text style={[S.metaText, { color: '#D97706' }]}>
                      {companyData.location?.city || companyData.location?.state}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* ── About ── */}
            {companyData.description && (
              <View style={S.sectionCard}>
                <View style={S.sectionHeader}>
                  <View style={S.sectionBar} />
                  <Text style={S.sectionTitle}>About Company</Text>
                </View>
                <Text style={S.bodyText}>{companyData.description}</Text>
              </View>
            )}

            {/* ── Location ── */}
            {(companyData.location?.city || companyData.location?.state) && (
              <View style={S.sectionCard}>
                <View style={S.sectionHeader}>
                  <View style={S.sectionBar} />
                  <Text style={S.sectionTitle}>Location</Text>
                </View>
                <View style={S.locationGrid}>
                  {companyData.location?.locality && (
                    <View style={S.locationRow}>
                      <Ionicons name="home-outline" size={16} color="#64748B" />
                      <Text style={S.locationText}>{companyData.location.locality}</Text>
                    </View>
                  )}
                  {(companyData.location?.city || companyData.location?.state) && (
                    <View style={S.locationRow}>
                      <Ionicons name="map-outline" size={16} color="#64748B" />
                      <Text style={S.locationText}>
                        {companyData.location.city}{companyData.location.city && companyData.location.state ? ', ' : ''}{companyData.location.state}
                      </Text>
                    </View>
                  )}
                  {companyData.location?.areaPincode && (
                    <View style={S.locationRow}>
                      <Ionicons name="navigate-outline" size={16} color="#64748B" />
                      <Text style={S.locationText}>Pincode: {companyData.location.areaPincode}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* ── Contact & Website ── */}
            {(company.phone || companyData.website || (socialProfile && socialLink)) && (
              <View style={S.sectionCard}>
                <View style={S.sectionHeader}>
                  <View style={S.sectionBar} />
                  <Text style={S.sectionTitle}>Contact & Website</Text>
                </View>
                <View style={S.contactRow}>
                  {company.phone && (
                    <TouchableOpacity style={S.contactItem}>
                      <Ionicons name="call-outline" size={18} color="#4F46E5" />
                      <Text style={S.contactText}>{company.phone}</Text>
                    </TouchableOpacity>
                  )}
                  {companyData.website && (
                    <TouchableOpacity style={S.contactItem} onPress={() => handleSocialMediaClick(companyData.website)}>
                      <Ionicons name="globe-outline" size={18} color="#4F46E5" />
                      <Text style={S.contactText}>Visit Website</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {socialProfile && socialLink && (
                  <TouchableOpacity style={S.socialBtn} onPress={() => handleSocialMediaClick(socialLink)}>
                    <Ionicons name="share-social-outline" size={18} color="#4F46E5" />
                    <Text style={S.socialBtnText}>{socialProfile}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* ── Industries ── */}
            {companyData.industrySubcategories && companyData.industrySubcategories.length > 0 && (
              <View style={S.sectionCard}>
                <View style={S.sectionHeader}>
                  <View style={S.sectionBar} />
                  <Text style={S.sectionTitle}>Industries</Text>
                </View>
                <View style={S.tagsWrap}>
                  {companyData.industrySubcategories.map((item, i) => (
                    <View key={i} style={S.tag}><Text style={S.tagText}>{item}</Text></View>
                  ))}
                </View>
              </View>
            )}

            {/* ── Departments ── */}
            {companyData.departmentSubcategories && companyData.departmentSubcategories.length > 0 && (
              <View style={S.sectionCard}>
                <View style={S.sectionHeader}>
                  <View style={S.sectionBar} />
                  <Text style={S.sectionTitle}>Departments</Text>
                </View>
                <View style={S.tagsWrap}>
                  {companyData.departmentSubcategories.map((item, i) => (
                    <View key={i} style={S.tag}><Text style={S.tagText}>{item}</Text></View>
                  ))}
                </View>
              </View>
            )}

            {/* ── Company Information ── */}
            {company.profile?.company?.company && (
              <View style={S.sectionCard}>
                <View style={S.sectionHeader}>
                  <View style={S.sectionBar} />
                  <Text style={S.sectionTitle}>Company Information</Text>
                </View>
                {(company.profile.company.company.revenue || company.profile.company.company.employeeCount) && (
                  <View style={S.infoGrid}>
                    {company.profile.company.company.revenue && (
                      <View style={S.infoItem}>
                        <Text style={S.infoLabel}>Revenue</Text>
                        <Text style={S.infoValue}>{company.profile.company.company.revenue}</Text>
                      </View>
                    )}
                    {company.profile.company.company.employeeCount && (
                      <View style={S.infoItem}>
                        <Text style={S.infoLabel}>Employees</Text>
                        <Text style={S.infoValue}>{company.profile.company.company.employeeCount}</Text>
                      </View>
                    )}
                  </View>
                )}
                {company.profile.company.company.departments?.length > 0 && (
                  <View style={S.subSection}>
                    <Text style={S.subTitle}>Departments</Text>
                    <View style={S.tagsWrap}>
                      {company.profile.company.company.departments.map((item, i) => (
                        <View key={i} style={S.tag}><Text style={S.tagText}>{item}</Text></View>
                      ))}
                    </View>
                  </View>
                )}
                {company.profile.company.company.benefits?.length > 0 && (
                  <View style={S.subSection}>
                    <Text style={S.subTitle}>Benefits</Text>
                    <View style={S.tagsWrap}>
                      {company.profile.company.company.benefits.map((item, i) => (
                        <View key={i} style={S.tag}><Text style={S.tagText}>{item}</Text></View>
                      ))}
                    </View>
                  </View>
                )}
                {company.profile.company.company.culture && (
                  <View style={S.subSection}>
                    <Text style={S.subTitle}>Company Culture</Text>
                    <Text style={S.bodyText}>{company.profile.company.company.culture}</Text>
                  </View>
                )}
                {company.profile.company.company.workEnvironment && (
                  <View style={S.subSection}>
                    <Text style={S.subTitle}>Work Environment</Text>
                    <Text style={S.bodyText}>{company.profile.company.company.workEnvironment}</Text>
                  </View>
                )}
              </View>
            )}

            {/* ── Open Positions ── */}
            {jobs.length > 0 && (
              <View style={S.sectionCard}>
                <View style={S.sectionHeader}>
                  <View style={S.sectionBar} />
                  <Text style={S.sectionTitle}>Open Positions</Text>
                  <View style={S.countBadge}><Text style={S.countBadgeText}>{jobs.length}</Text></View>
                </View>
                {jobs.slice(0, 5).map((job, i) => (
                  <TouchableOpacity key={i} style={S.jobRow} onPress={() => navigation.navigate('JobDetails', { jobId: job._id })} activeOpacity={0.8}>
                    <View style={S.jobIconWrap}>
                      <Ionicons name="briefcase-outline" size={16} color="#4F46E5" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={S.jobTitle}>{job.title}</Text>
                      <View style={S.jobMeta}>
                        {(job.location?.city || job.location?.state) && (
                          <View style={S.jobMetaItem}>
                            <Ionicons name="location-outline" size={12} color="#64748B" />
                            <Text style={S.jobMetaText}>{job.location?.city}{job.location?.state ? `, ${job.location.state}` : ''}</Text>
                          </View>
                        )}
                        {job.salaryMin && (
                          <View style={S.jobMetaItem}>
                            <Ionicons name="cash-outline" size={12} color="#059669" />
                            <Text style={[S.jobMetaText, { color: '#059669' }]}>
                              {api.formatIndianCurrency(job.salaryMin)}{job.salaryMax ? ` - ${api.formatIndianCurrency(job.salaryMax)}` : '+'}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                ))}
                {jobs.length > 5 && (
                  <TouchableOpacity style={S.viewAllBtn} onPress={() => navigation.navigate('Jobs', { company: companyData.name })}>
                    <Text style={S.viewAllText}>View All {jobs.length} Jobs</Text>
                    <Ionicons name="arrow-forward" size={14} color="#4F46E5" />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* ── Similar Companies (mobile) ── */}
            {!isDesktop && similarCompanies.length > 0 && (
              <View style={S.sectionCard}>
                <View style={S.sectionHeader}>
                  <View style={S.sectionBar} />
                  <Text style={S.sectionTitle}>Similar Companies</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {similarCompanies.map((sc) => {
                    const scName = sc.name || sc.profile?.company?.name || 'Company';
                    const scIndustry = sc.industry || sc.profile?.company?.industry;
                    const scPositions = sc.openPositions || 0;
                    return (
                      <TouchableOpacity key={sc._id} style={S.mobileSCCard} onPress={() => handleSimilarCompanyClick(sc._id)} activeOpacity={0.8}>
                        <View style={[S.scAvatar, { backgroundColor: getAvatarColor(scName) }]}>
                          <Text style={S.scAvatarText}>{getInitials(scName)}</Text>
                        </View>
                        <Text style={S.scName} numberOfLines={1}>{scName}</Text>
                        {scIndustry && <Text style={S.scIndustry} numberOfLines={1}>{scIndustry}</Text>}
                        {scPositions > 0 && <Text style={S.scPositions}>{scPositions} Positions</Text>}
                        <View style={S.scFooter}>
                          <Text style={S.scViewText}>View</Text>
                          <Ionicons name="chevron-forward" size={12} color="#4F46E5" />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

          </View>
        </ScrollView>

        {/* ── Sidebar (desktop) ── */}
        {isDesktop && similarCompanies.length > 0 && (
          <View style={dynamicStyles.sidebar}>
            <View style={S.sectionCard}>
              <View style={S.sectionHeader}>
                <View style={S.sectionBar} />
                <Text style={S.sectionTitle}>Similar Companies</Text>
              </View>
              {similarCompanies.map((sc) => {
                const scName = sc.name || sc.profile?.company?.name || 'Company';
                const scLocation = sc.location || sc.profile?.company?.location;
                const scIndustry = sc.industry || sc.profile?.company?.industry;
                const scSize = sc.size || sc.profile?.company?.size;
                const scPositions = sc.openPositions || 0;
                return (
                  <TouchableOpacity key={sc._id} style={S.scCard} onPress={() => handleSimilarCompanyClick(sc._id)} activeOpacity={0.8}>
                    <View style={S.scRow}>
                      <View style={[S.scAvatar, { backgroundColor: getAvatarColor(scName) }]}>
                        <Text style={S.scAvatarText}>{getInitials(scName)}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={S.scName} numberOfLines={2}>{scName}</Text>
                        {scIndustry && <Text style={S.scIndustry} numberOfLines={1}>{scIndustry}</Text>}
                      </View>
                    </View>
                    <View style={S.scMeta}>
                      {scLocation && (
                        <View style={S.scMetaRow}>
                          <Ionicons name="location-outline" size={12} color="#64748B" />
                          <Text style={S.scMetaText} numberOfLines={1}>{formatCompanyLocation(scLocation)}</Text>
                        </View>
                      )}
                      {scSize && (
                        <View style={S.scMetaRow}>
                          <Ionicons name="people-outline" size={12} color="#64748B" />
                          <Text style={S.scMetaText}>{scSize}</Text>
                        </View>
                      )}
                      {scPositions > 0 && (
                        <View style={S.scMetaRow}>
                          <Ionicons name="briefcase-outline" size={12} color="#059669" />
                          <Text style={[S.scMetaText, { color: '#059669' }]}>{scPositions} Open Positions</Text>
                        </View>
                      )}
                    </View>
                    <View style={S.scFooter}>
                      <Text style={S.scViewText}>View Company</Text>
                      <Ionicons name="chevron-forward" size={14} color="#4F46E5" />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

// Dynamic layout styles
const getDynamicStyles = ({ isXsPhone, isSmallPhone, isPhone, isMobile, isTablet, isDesktop, width }) => {
  const hPad = isMobile ? 12 : isTablet ? 20 : 24;
  return {
    contentWrapper: {
      flex: 1,
      flexDirection: isDesktop ? 'row' : 'column',
      backgroundColor: '#F1F5F9',
    },
    scrollContent: {
      padding: hPad,
      paddingBottom: 40,
    },
    mainColumn: {
      width: '100%',
      maxWidth: isDesktop ? 860 : '100%',
      alignSelf: isDesktop ? 'flex-start' : 'center',
    },
    sidebar: {
      width: isDesktop ? 340 : '100%',
      backgroundColor: '#F1F5F9',
      borderLeftWidth: isDesktop ? 1 : 0,
      borderLeftColor: '#E2E8F0',
      padding: 16,
      ...(isDesktop && {
        position: 'sticky',
        top: 0,
        height: '100vh',
        maxHeight: '100vh',
        overflowY: 'auto',
      }),
    },
  };
};

const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  scrollView: { flex: 1 },

  // Loading / Error
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 12, color: '#64748B', fontSize: 15 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  errorText: { fontSize: 20, fontWeight: '700', color: '#EF4444', marginTop: 16 },
  backButton: { marginTop: 20, backgroundColor: '#4F46E5', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  backButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  // Hero Card
  heroCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 20,
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, marginBottom: 14,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  avatar: {
    width: 64, height: 64, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 24, fontWeight: '800', color: '#fff' },
  heroInfo: { flex: 1, gap: 6 },
  companyName: { fontSize: 24, fontWeight: '800', color: '#0F172A', lineHeight: 30 },
  typePill: {
    alignSelf: 'flex-start', backgroundColor: '#F1F5F9',
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0',
  },
  typePillText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1,
  },
  metaBlue: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
  metaPurple: { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' },
  metaGreen: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  metaAmber: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
  metaText: { fontSize: 12, fontWeight: '600' },

  // Section Cards
  sectionCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 20,
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 1, marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginBottom: 14, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  sectionBar: { width: 4, height: 20, borderRadius: 2, backgroundColor: '#4F46E5' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', flex: 1 },
  bodyText: { fontSize: 14, color: '#334155', lineHeight: 24 },

  // Count badge
  countBadge: {
    backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 10, borderWidth: 1, borderColor: '#C7D2FE',
  },
  countBadgeText: { fontSize: 12, fontWeight: '700', color: '#4338CA' },

  // Location
  locationGrid: { gap: 10 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  locationText: { fontSize: 14, color: '#334155' },

  // Contact
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  contactItem: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F8FAFC', paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', flex: 1,
  },
  contactText: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  socialBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#EEF2FF', paddingVertical: 10, borderRadius: 10,
    borderWidth: 1, borderColor: '#C7D2FE',
  },
  socialBtnText: { fontSize: 14, fontWeight: '600', color: '#4F46E5' },

  // Tags
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
  },
  tagText: { fontSize: 13, fontWeight: '600', color: '#4338CA' },

  // Info grid
  infoGrid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  infoItem: {
    flex: 1, backgroundColor: '#F8FAFC', padding: 14,
    borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center',
  },
  infoLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: '700', color: '#0F172A' },

  // Sub sections
  subSection: { marginTop: 16 },
  subTitle: { fontSize: 13, fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 10 },

  // Jobs
  jobRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F8FAFC',
  },
  jobIconWrap: {
    width: 34, height: 34, borderRadius: 8,
    backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  jobTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  jobMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  jobMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  jobMetaText: { fontSize: 12, color: '#64748B' },
  viewAllBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingTop: 14, marginTop: 4, borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  viewAllText: { fontSize: 14, fontWeight: '700', color: '#4F46E5' },

  // Similar Company Card (sidebar)
  scCard: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  scRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  scAvatar: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  scAvatarText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  scName: { fontSize: 14, fontWeight: '700', color: '#0F172A', lineHeight: 20, marginBottom: 2 },
  scIndustry: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  scMeta: { gap: 4, marginBottom: 8 },
  scMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  scMetaText: { fontSize: 12, color: '#64748B', flex: 1 },
  scPositions: { fontSize: 12, fontWeight: '600', color: '#059669', marginTop: 4 },
  scFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  scViewText: { fontSize: 13, fontWeight: '700', color: '#4F46E5' },

  // Mobile Similar Company Card
  mobileSCCard: {
    backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14,
    marginRight: 12, width: 160, borderWidth: 1, borderColor: '#E2E8F0',
    alignItems: 'center',
  },
});

export default CompanyDetailsScreen;
