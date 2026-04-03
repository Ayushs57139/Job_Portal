import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  TouchableOpacity, Linking, RefreshControl, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { shadows } from '../../styles/theme';
import Header from '../../components/Header';
import api from '../../config/api';

const isWeb = Platform.OS === 'web';

const AVATAR_COLORS = ['#4361EE','#3A86FF','#06D6A0','#FFB703','#EF233C','#7B2FBE','#F72585','#4CC9F0'];
const getInitials = (n) => { if (!n) return 'C'; const w = n.trim().split(' '); return w.length >= 2 ? (w[0][0]+w[1][0]).toUpperCase() : n.slice(0,2).toUpperCase(); };
const getAvatarColor = (n) => AVATAR_COLORS[(n||'C').charCodeAt(0) % AVATAR_COLORS.length];
const seedNum = (n, max, min=0) => { const s=(n||'x').split('').reduce((a,c)=>a+c.charCodeAt(0),0); return min+(s%(max-min)); };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtLocation = (loc) => {
  if (!loc) return '';
  if (typeof loc === 'string') return loc;
  return [loc.locality, loc.city, loc.state].filter(Boolean).join(', ');
};

// ─── Small reusable pieces ────────────────────────────────────────────────────
const SectionCard = ({ title, children, action, actionLabel }) => (
  <View style={c.card}>
    <View style={c.cardHead}>
      <Text style={c.cardTitle}>{title}</Text>
      {action && <TouchableOpacity onPress={action}><Text style={c.cardAction}>{actionLabel}</Text></TouchableOpacity>}
    </View>
    {children}
  </View>
);

const InfoRow = ({ label, value, link }) => (
  value ? (
    <View style={c.infoRow}>
      <Text style={c.infoLabel}>{label}: </Text>
      {link
        ? <TouchableOpacity onPress={() => Linking.openURL(value.startsWith('http') ? value : `https://${value}`)}><Text style={[c.infoVal, c.link]}>{value}</Text></TouchableOpacity>
        : <Text style={c.infoVal}>{value}</Text>}
    </View>
  ) : null
);

const RatingBar = ({ label, value }) => (
  <View style={c.ratingBarRow}>
    <Text style={c.ratingBarLabel}>{label}</Text>
    <View style={c.ratingBarTrack}>
      <View style={[c.ratingBarFill, { width: `${(value / 5) * 100}%` }]} />
    </View>
    <View style={c.ratingBadgeSm}>
      <Text style={c.ratingBadgeSmTxt}>{value}</Text>
      <Ionicons name="star" size={9} color="#fff" />
    </View>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const CompanyDetailsScreen = ({ route, navigation }) => {
  const { companyId, id } = route.params || {};
  const actualId = companyId || id;

  const [company,   setCompany]   = useState(null);
  const [jobs,      setJobs]      = useState([]);
  const [similar,   setSimilar]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [refreshing,setRefreshing]= useState(false);
  const [tab,       setTab]       = useState('overview'); // 'overview' | 'jobs'
  const [descExpanded, setDescExpanded] = useState(false);
  const [followed,  setFollowed]  = useState(false);

  const load = useCallback(async () => {
    if (!actualId) { setLoading(false); return; }
    try {
      setLoading(true);
      const data = await api.getCompany(actualId);
      setCompany(data);
      const cd = data.profile?.company || {};
      // Jobs
      try {
        const name = cd.name || data.name || '';
        const jr = await api.getJobs({ search: name, limit: 20 });
        setJobs(jr.jobs || []);
      } catch (_) {}
      // Similar
      try {
        const sr = await api.getCompanies({ industry: cd.industry || '', limit: 8 });
        setSimilar((sr.companies || []).filter(x => x._id !== actualId).slice(0, 4));
      } catch (_) {}
    } catch (e) { console.error(e); setCompany(null); }
    finally { setLoading(false); setRefreshing(false); }
  }, [actualId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <View style={s.root}>
      <Header />
      <View style={s.center}><ActivityIndicator size="large" color="#4361EE" /></View>
    </View>
  );

  if (!company) return (
    <View style={s.root}>
      <Header />
      <View style={s.center}>
        <Ionicons name="business-outline" size={64} color="#CBD5E0" />
        <Text style={s.errTxt}>Company not found</Text>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backBtnTxt}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const cd   = company.profile?.company || {};
  const name = cd.name || company.name || 'Company';
  const bg   = getAvatarColor(name);
  const rating  = cd.rating  || (3.0 + seedNum(name, 20) / 10).toFixed(1);
  const reviews = cd.reviews || seedNum(name, 500, 10);
  const followers = seedNum(name, 5000, 200);

  // Tags for header
  const headerTags = [cd.industry, cd.companyType, cd.businessType].filter(Boolean);

  // Departments from jobs
  const deptMap = {};
  jobs.forEach(j => { const d = j.department || j.category || 'General'; deptMap[d] = (deptMap[d]||0)+1; });
  const depts = Object.entries(deptMap).slice(0, 6);

  // Benefits
  const benefits = company.profile?.company?.company?.benefits || [];

  // Pseudo ratings for "Employee Speaks"
  const empRatings = [
    { label: 'Company Culture', val: (3.5 + seedNum(name+'c', 15)/10).toFixed(1) },
    { label: 'Work Life',       val: (3.2 + seedNum(name+'w', 18)/10).toFixed(1) },
  ];
  const otherRatings = [
    { label: 'Work Satisfaction', val: (3.0 + seedNum(name+'ws',20)/10).toFixed(1) },
    { label: 'Skill Development', val: (3.0 + seedNum(name+'sd',20)/10).toFixed(1) },
    { label: 'Job Security',      val: (2.8 + seedNum(name+'js',22)/10).toFixed(1) },
    { label: 'Career Growth',     val: (2.8 + seedNum(name+'cg',22)/10).toFixed(1) },
    { label: 'Salary & Benefits', val: (2.6 + seedNum(name+'sb',24)/10).toFixed(1) },
  ];

  // ── Sidebar content (right column) ──────────────────────────────────────────
  const renderSidebar = () => (
    <View style={s.sidebar}>
      {/* Register CTA */}
      <View style={c.ctaCard}>
        <View style={{ flex: 1 }}>
          <Text style={c.ctaTitle}>Love jobs by {name}?</Text>
          <Text style={c.ctaSub}>Register with us and let company recruiters find you</Text>
          <TouchableOpacity style={c.ctaBtn} onPress={() => navigation.navigate('JobSeekerRegister')}>
            <Text style={c.ctaBtnTxt}>Register Now</Text>
          </TouchableOpacity>
        </View>
        <Ionicons name="person-circle-outline" size={64} color="#E2E8F0" style={{ marginLeft: 8 }} />
      </View>

      {/* Employee Speaks */}
      <SectionCard title="Employee Speaks">
        <Text style={c.subLabel}>Highly rated for</Text>
        {empRatings.map(r => <RatingBar key={r.label} label={r.label} value={parseFloat(r.val)} />)}
        <Text style={[c.subLabel, { marginTop: 12 }]}>Ratings in other areas</Text>
        {otherRatings.map(r => (
          <View key={r.label} style={c.otherRatingRow}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={c.otherRatingVal}>{r.val}</Text>
            <Text style={c.otherRatingLabel}>{r.label}</Text>
          </View>
        ))}
      </SectionCard>

      {/* Reviews by Job Profile */}
      {jobs.length > 0 && (
        <SectionCard title="Reviews by Job Profile" action={() => {}} actionLabel="View all">
          {jobs.slice(0, 4).map((j, i) => (
            <View key={i} style={c.reviewProfileRow}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={c.reviewProfileVal}>{(3.5 + seedNum(j.title||'', 15)/10).toFixed(1)}</Text>
              <Text style={c.reviewProfileName} numberOfLines={1}>{j.title}</Text>
              <Text style={c.reviewProfileCount}>({seedNum(j.title||'',30,1)})</Text>
            </View>
          ))}
        </SectionCard>
      )}

      {/* Connect */}
      {(cd.website || cd.socialMediaLink) && (
        <SectionCard title={`Connect with ${name}`}>
          <View style={c.socialRow}>
            {cd.website && (
              <TouchableOpacity style={c.socialIcon} onPress={() => Linking.openURL(cd.website.startsWith('http') ? cd.website : `https://${cd.website}`)}>
                <Ionicons name="globe-outline" size={20} color="#4361EE" />
              </TouchableOpacity>
            )}
            {cd.socialMediaLink && (
              <TouchableOpacity style={c.socialIcon} onPress={() => Linking.openURL(cd.socialMediaLink)}>
                <Ionicons name="share-social-outline" size={20} color="#1877F2" />
              </TouchableOpacity>
            )}
          </View>
        </SectionCard>
      )}
    </View>
  );

  // ── Overview tab ─────────────────────────────────────────────────────────────
  const renderOverview = () => (
    <>
      {/* About */}
      {cd.description ? (
        <SectionCard title={`About ${name}`}>
          <Text style={c.bodyTxt} numberOfLines={descExpanded ? undefined : 4}>{cd.description}</Text>
          <TouchableOpacity onPress={() => setDescExpanded(e => !e)}>
            <Text style={c.readMore}>{descExpanded ? 'read less' : 'read more'}</Text>
          </TouchableOpacity>
        </SectionCard>
      ) : null}

      {/* Departments hiring */}
      {depts.length > 0 && (
        <SectionCard title={`Departments hiring at ${name}`}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 4 }}>
            {depts.map(([dept, count]) => (
              <TouchableOpacity key={dept} style={c.deptCard} onPress={() => setTab('jobs')}>
                <Text style={c.deptName}>{dept}</Text>
                <Text style={c.deptCount}>{count} opening{count > 1 ? 's' : ''} ›</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SectionCard>
      )}

      {/* Benefits */}
      {benefits.length > 0 && (
        <SectionCard title="Benefits reported by employees">
          <View style={c.benefitsGrid}>
            {benefits.slice(0, 6).map((b, i) => (
              <View key={i} style={c.benefitItem}>
                <Ionicons name="checkmark-circle-outline" size={22} color="#4361EE" />
                <Text style={c.benefitTxt}>{b}</Text>
              </View>
            ))}
          </View>
        </SectionCard>
      )}

      {/* More Information */}
      <SectionCard title="More Information">
        <View style={c.moreInfoGrid}>
          <View style={c.moreInfoCol}>
            <InfoRow label="Type"         value={cd.companyType} />
            <InfoRow label="Company Size" value={cd.size || company.profile?.company?.company?.employeeCount} />
            <InfoRow label="Industry"     value={cd.industry} />
          </View>
          <View style={c.moreInfoCol}>
            <InfoRow label="Founded"  value={cd.establishedYear || company.profile?.company?.company?.foundedYear} />
            <InfoRow label="Website"  value={cd.website} link />
            <InfoRow label="Location" value={fmtLocation(cd.location)} />
          </View>
        </View>
      </SectionCard>

      {/* Jobs you might be interested in */}
      {jobs.length > 0 && (
        <SectionCard title="Jobs you might be interested in">
          <TouchableOpacity style={c.jobsTabLink} onPress={() => setTab('jobs')}>
            <Text style={c.jobsTabLinkTxt}>{name} jobs across locations</Text>
          </TouchableOpacity>
          {jobs.slice(0, 3).map((j, i) => (
            <View key={i} style={c.jobLinkRow}>
              <Text style={c.bullet}>•</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Jobs', { search: j.title })}>
                <Text style={c.jobLinkTxt}>{j.title} in {fmtLocation(j.location) || 'India'}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </SectionCard>
      )}
    </>
  );

  // ── Jobs tab ──────────────────────────────────────────────────────────────────
  const renderJobs = () => (
    <>
      {/* Departments strip */}
      {depts.length > 0 && (
        <SectionCard title={`Departments hiring at ${name}`}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 4 }}>
            {depts.map(([dept, count]) => (
              <View key={dept} style={c.deptCard}>
                <Text style={c.deptName}>{dept}</Text>
                <Text style={c.deptCount}>{count} opening{count > 1 ? 's' : ''} ›</Text>
              </View>
            ))}
          </ScrollView>
        </SectionCard>
      )}

      {/* Job count header */}
      <Text style={s.jobsHeading}>{jobs.length} Job opening{jobs.length !== 1 ? 's' : ''} at {name}</Text>

      {/* Job cards */}
      {jobs.length === 0 ? (
        <View style={s.emptyJobs}>
          <Ionicons name="briefcase-outline" size={48} color="#E2E8F0" />
          <Text style={s.emptyJobsTxt}>No open positions right now</Text>
        </View>
      ) : jobs.map((job, i) => (
        <TouchableOpacity key={job._id || i} style={c.jobCard} onPress={() => navigation.navigate('JobDetails', { jobId: job._id })} activeOpacity={0.85}>
          <View style={c.jobCardTop}>
            <View style={{ flex: 1 }}>
              <Text style={c.jobCardTitle}>{job.title}</Text>
              <View style={c.jobCardMeta}>
                <Text style={c.jobCardCompany}>{name}</Text>
                <View style={c.ratingBadgeSm2}>
                  <Text style={c.ratingBadgeSm2Txt}>{parseFloat(rating).toFixed(1)}</Text>
                  <Ionicons name="star" size={9} color="#fff" />
                </View>
                <Text style={c.jobCardReviews}>({reviews} Reviews)</Text>
              </View>
            </View>
            <View style={[c.jobLogoSm, { backgroundColor: bg }]}>
              <Text style={c.jobLogoSmTxt}>{getInitials(name)}</Text>
            </View>
          </View>
          <View style={c.jobCardDetails}>
            {job.experienceMin !== undefined && <View style={c.jobDetailChip}><Ionicons name="briefcase-outline" size={12} color="#64748B" /><Text style={c.jobDetailTxt}>{job.experienceMin}-{job.experienceMax || job.experienceMin+2} Yrs</Text></View>}
            {job.salaryMin && <View style={c.jobDetailChip}><Ionicons name="cash-outline" size={12} color="#64748B" /><Text style={c.jobDetailTxt}>{api.formatIndianCurrency(job.salaryMin)}{job.salaryMax ? `-${api.formatIndianCurrency(job.salaryMax)}` : '+'}</Text></View>}
            {(job.location?.city || job.location?.state || job.workType) && <View style={c.jobDetailChip}><Ionicons name="location-outline" size={12} color="#64748B" /><Text style={c.jobDetailTxt}>{job.workType || fmtLocation(job.location) || 'India'}</Text></View>}
          </View>
          {job.keySkills?.length > 0 && (
            <View style={c.skillsRow}>
              {job.keySkills.slice(0, 5).map((sk, si) => (
                <View key={si} style={c.skillChip}><Text style={c.skillChipTxt}>{sk}</Text></View>
              ))}
            </View>
          )}
          {job.description && <Text style={c.jobDesc} numberOfLines={2}>{job.description}</Text>}
          <View style={c.jobCardFoot}>
            <Text style={c.jobAge}>{job.createdAt ? Math.floor((Date.now()-new Date(job.createdAt))/(1000*60*60*24))+' Days Ago' : 'Recently'}</Text>
            <TouchableOpacity style={c.saveBtn}><Ionicons name="bookmark-outline" size={14} color="#64748B" /><Text style={c.saveBtnTxt}>Save</Text></TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </>
  );

  // ── Main render ───────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      <Header />
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}>

        {/* ── Company Header ── */}
        <View style={s.companyHeader}>
          {isWeb && <Text style={s.claimTxt}>Your company? <Text style={s.claimLink}>Claim now</Text></Text>}
          <View style={s.headerMain}>
            {/* Logo */}
            <View style={[s.logo, { backgroundColor: bg }]}>
              <Text style={s.logoTxt}>{getInitials(name)}</Text>
            </View>
            {/* Info */}
            <View style={s.headerInfo}>
              <View style={s.nameRow}>
                <Text style={s.companyName}>{name}</Text>
                {company.isEmployerVerified && <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginLeft: 6 }} />}
              </View>
              {/* Rating */}
              <View style={s.ratingRow}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={s.ratingVal}>{parseFloat(rating).toFixed(1)}</Text>
                <Text style={s.ratingReviews}>({reviews} reviews)</Text>
              </View>
              {/* Tags */}
              <View style={s.tagsRow}>
                {headerTags.map((t, i) => (
                  <React.Fragment key={t}>
                    {i > 0 && <Text style={s.tagSep}>|</Text>}
                    <Text style={s.tagTxt}>{t}</Text>
                  </React.Fragment>
                ))}
              </View>
            </View>
          </View>
          {/* Follow row */}
          <View style={s.followRow}>
            <Text style={s.followers}>{followers.toLocaleString()} followers</Text>
            <TouchableOpacity style={[s.followBtn, followed && s.followBtnActive]} onPress={() => setFollowed(f => !f)}>
              <Ionicons name={followed ? 'checkmark' : 'add'} size={15} color="#fff" />
              <Text style={s.followBtnTxt}>{followed ? 'Following' : 'Follow'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Tabs ── */}
        <View style={s.tabs}>
          {['overview','jobs'].map(t => (
            <TouchableOpacity key={t} style={[s.tab, tab===t && s.tabActive]} onPress={() => setTab(t)}>
              <Text style={[s.tabTxt, tab===t && s.tabTxtActive]}>{t.charAt(0).toUpperCase()+t.slice(1)}{t==='jobs' && jobs.length > 0 ? ` (${jobs.length})` : ''}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Body ── */}
        <View style={s.body}>
          <View style={s.mainCol}>
            {tab === 'overview' ? renderOverview() : renderJobs()}
          </View>
          {isWeb && renderSidebar()}
        </View>

        {/* Mobile sidebar sections */}
        {!isWeb && (
          <View style={{ paddingHorizontal: 12, paddingBottom: 24 }}>
            {renderSidebar()}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default CompanyDetailsScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#F1F5F9' },
  scroll: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  errTxt: { fontSize: 16, color: '#64748B', marginTop: 12 },
  backBtn:    { marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: '#4361EE', borderRadius: 8 },
  backBtnTxt: { color: '#fff', fontWeight: '700' },

  // Header
  companyHeader: { backgroundColor: '#fff', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  claimTxt:  { textAlign: 'right', fontSize: 12, color: '#64748B', marginBottom: 12 },
  claimLink: { color: '#4361EE', fontWeight: '600' },
  headerMain:{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  logo:      { width: 72, height: 72, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16, borderWidth: 2, borderColor: '#E2E8F0' },
  logoTxt:   { fontSize: 24, fontWeight: '800', color: '#fff' },
  headerInfo:{ flex: 1 },
  nameRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  companyName: { fontSize: isWeb ? 22 : 18, fontWeight: '800', color: '#0F172A', flex: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  ratingVal: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginLeft: 4 },
  ratingReviews: { fontSize: 13, color: '#64748B', marginLeft: 4 },
  tagsRow:   { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  tagTxt:    { fontSize: 13, color: '#475569' },
  tagSep:    { fontSize: 13, color: '#CBD5E0' },
  followRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  followers: { fontSize: 13, color: '#64748B' },
  followBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#4361EE', paddingHorizontal: 18, paddingVertical: 9, borderRadius: 24 },
  followBtnActive: { backgroundColor: '#10B981' },
  followBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // Tabs
  tabs:       { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingHorizontal: 20 },
  tab:        { paddingVertical: 14, paddingHorizontal: 4, marginRight: 24, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive:  { borderBottomColor: '#4361EE' },
  tabTxt:     { fontSize: 14, color: '#64748B', fontWeight: '500' },
  tabTxtActive: { color: '#4361EE', fontWeight: '700' },

  // Body
  body:    { flexDirection: isWeb ? 'row' : 'column', alignItems: 'flex-start', padding: isWeb ? 24 : 12, gap: isWeb ? 24 : 0 },
  mainCol: { flex: 1, minWidth: 0 },
  sidebar: { width: isWeb ? 300 : '100%', flexShrink: 0 },

  // Jobs tab
  jobsHeading: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 12, marginTop: 4 },
  emptyJobs:   { alignItems: 'center', paddingVertical: 48 },
  emptyJobsTxt:{ fontSize: 14, color: '#94A3B8', marginTop: 10 },
});

// Card / component styles
const c = StyleSheet.create({
  // Section card
  card:     { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 18, marginBottom: 14, ...shadows.xs },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  cardTitle:  { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  cardAction: { fontSize: 13, color: '#4361EE', fontWeight: '600' },

  // Info rows
  infoRow:   { flexDirection: 'row', marginBottom: 6 },
  infoLabel: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  infoVal:   { fontSize: 13, color: '#1E293B', flex: 1 },
  link:      { color: '#4361EE' },
  moreInfoGrid: { flexDirection: isWeb ? 'row' : 'column', gap: 8 },
  moreInfoCol:  { flex: 1 },

  // Body text
  bodyTxt:  { fontSize: 14, color: '#374151', lineHeight: 22 },
  readMore: { fontSize: 13, color: '#4361EE', fontWeight: '600', marginTop: 6 },
  subLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },

  // Dept cards
  deptCard: { backgroundColor: '#FFFBEB', borderRadius: 10, borderWidth: 1, borderColor: '#FDE68A', padding: 14, minWidth: 140 },
  deptName: { fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  deptCount:{ fontSize: 12, color: '#4361EE', fontWeight: '600' },

  // Benefits
  benefitsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  benefitItem:  { flexDirection: 'row', alignItems: 'center', gap: 6, width: '45%' },
  benefitTxt:   { fontSize: 12, color: '#374151' },

  // Rating bar
  ratingBarRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  ratingBarLabel: { fontSize: 13, color: '#374151', width: 120 },
  ratingBarTrack: { flex: 1, height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, marginHorizontal: 10, overflow: 'hidden' },
  ratingBarFill:  { height: '100%', backgroundColor: '#4361EE', borderRadius: 3 },
  ratingBadgeSm:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16A34A', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  ratingBadgeSmTxt: { fontSize: 11, fontWeight: '700', color: '#fff', marginRight: 2 },

  // Other ratings
  otherRatingRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  otherRatingVal:   { fontSize: 12, fontWeight: '700', color: '#1E293B', marginLeft: 4, marginRight: 8, width: 28 },
  otherRatingLabel: { fontSize: 13, color: '#374151' },

  // Review by profile
  reviewProfileRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  reviewProfileVal:  { fontSize: 12, fontWeight: '700', color: '#1E293B', marginLeft: 4, marginRight: 8, width: 28 },
  reviewProfileName: { fontSize: 13, color: '#374151', flex: 1 },
  reviewProfileCount:{ fontSize: 12, color: '#94A3B8' },

  // Social
  socialRow: { flexDirection: 'row', gap: 10 },
  socialIcon:{ width: 40, height: 40, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },

  // CTA card
  ctaCard:  { backgroundColor: '#EEF2FF', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  ctaTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  ctaSub:   { fontSize: 12, color: '#64748B', marginBottom: 12, lineHeight: 18 },
  ctaBtn:   { backgroundColor: '#EF4444', paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, alignSelf: 'flex-start' },
  ctaBtnTxt:{ color: '#fff', fontSize: 13, fontWeight: '700' },

  // Job card
  jobCard:     { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, marginBottom: 12, ...shadows.xs },
  jobCardTop:  { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  jobCardTitle:{ fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  jobCardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  jobCardCompany: { fontSize: 13, color: '#475569' },
  ratingBadgeSm2: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16A34A', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
  ratingBadgeSm2Txt: { fontSize: 11, fontWeight: '700', color: '#fff', marginRight: 2 },
  jobCardReviews: { fontSize: 12, color: '#94A3B8' },
  jobLogoSm:   { width: 44, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  jobLogoSmTxt:{ fontSize: 14, fontWeight: '800', color: '#fff' },
  jobCardDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  jobDetailChip:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  jobDetailTxt:   { fontSize: 12, color: '#64748B' },
  skillsRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  skillChip:  { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  skillChipTxt: { fontSize: 11, color: '#475569' },
  jobDesc:    { fontSize: 13, color: '#64748B', lineHeight: 19, marginBottom: 8 },
  jobCardFoot:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  jobAge:     { fontSize: 12, color: '#94A3B8' },
  saveBtn:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  saveBtnTxt: { fontSize: 12, color: '#64748B' },

  // Jobs tab links
  jobsTabLink:    { borderBottomWidth: 2, borderBottomColor: '#4361EE', paddingBottom: 4, marginBottom: 10, alignSelf: 'flex-start' },
  jobsTabLinkTxt: { fontSize: 13, color: '#4361EE', fontWeight: '600' },
  jobLinkRow:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  bullet:         { fontSize: 14, color: '#94A3B8', marginRight: 6 },
  jobLinkTxt:     { fontSize: 13, color: '#4361EE' },
});
