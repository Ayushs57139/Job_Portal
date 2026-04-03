import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TextInput, StyleSheet,
  ActivityIndicator, RefreshControl, TouchableOpacity, Modal, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { shadows } from '../../styles/theme';
import Header from '../../components/Header';
import JobCard from '../../components/JobCard';
import AdvertisementWidget from '../../components/AdvertisementWidget';
import api from '../../config/api';

const isWeb = Platform.OS === 'web';

// ─── Constants ────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ['#4361EE','#3A86FF','#06D6A0','#FFB703','#EF233C','#7B2FBE','#F72585','#4CC9F0'];
const getAvatarColor = (n) => AVATAR_COLORS[(n||'x').charCodeAt(0) % AVATAR_COLORS.length];
const getInitials = (n) => { if (!n) return 'C'; const w = n.trim().split(' '); return w.length >= 2 ? (w[0][0]+w[1][0]).toUpperCase() : n.slice(0,2).toUpperCase(); };
const seedNum = (n, max, min=0) => { const s=(n||'x').split('').reduce((a,c)=>a+c.charCodeAt(0),0); return min+(s%(max-min)); };

const QUICK_CATEGORIES = [
  { id: 'remote',   label: 'Remote',        icon: 'home-outline',       filter: { workMode: ['wfh'] } },
  { id: 'mnc',      label: 'MNC',           icon: 'business-outline',   filter: { company: 'mnc' } },
  { id: 'analytics',label: 'Analytics',     icon: 'analytics-outline',  filter: { search: 'analytics' } },
  { id: 'marketing',label: 'Marketing',     icon: 'trending-up-outline',filter: { search: 'marketing' } },
  { id: 'sales',    label: 'Sales',         icon: 'briefcase-outline',  filter: { search: 'sales' } },
  { id: 'startup',  label: 'Startup',       icon: 'rocket-outline',     filter: { company: 'startup' } },
  { id: 'data',     label: 'Data Science',  icon: 'bar-chart-outline',  filter: { search: 'data science' } },
  { id: 'software', label: 'Software & IT', icon: 'code-slash-outline', filter: { search: 'software' } },
  { id: 'engineering',label:'Engineering',  icon: 'construct-outline',  filter: { search: 'engineering' } },
  { id: 'banking',  label: 'Banking & Finance',icon:'card-outline',     filter: { search: 'banking' } },
];

const TOP_COMPANY_CATEGORIES = [
  { id: 'mnc',        label: 'MNCs',        sub: '2.3K+ are actively hiring', color: '#4361EE' },
  { id: 'edtech',     label: 'Edtech',      sub: '171 are actively hiring',   color: '#EF233C' },
  { id: 'healthcare', label: 'Healthcare',  sub: '709 are actively hiring',   color: '#06D6A0' },
  { id: 'unicorn',    label: 'Unicorns',    sub: '99 are actively hiring',    color: '#FFB703' },
  { id: 'internet',   label: 'Internet',    sub: '252 are actively hiring',   color: '#7B2FBE' },
];

const POPULAR_ROLES = [
  { title: 'Full Stack Developer',  jobs: '22.2K+' },
  { title: 'Mobile / App Developer',jobs: '2.8K+' },
  { title: 'Front End Developer',   jobs: '5.3K+' },
  { title: 'DevOps Engineer',       jobs: '2.9K+' },
  { title: 'Engineering Manager',   jobs: '1.5K+' },
  { title: 'Technical Lead',        jobs: '10K+' },
  { title: 'Business Analyst',      jobs: '8.2K+' },
  { title: 'Product Manager',       jobs: '4.1K+' },
];

const EXPERIENCE_OPTIONS = [
  'All Experience', 'Fresher (0-1 year)', '1-3 years', '3-5 years', '5-10 years', '10+ years',
];

const INDUSTRY_TABS = ['All', 'IT Services', 'Technology', 'Healthcare & Life Sciences', 'Infrastructure', 'Manufacturing', 'BFSI', 'BPM'];

const DATE_OPTIONS   = [{ id:'all',label:'All' },{ id:'24h',label:'Last 24 hours' },{ id:'3d',label:'Last 3 days' },{ id:'7d',label:'Last 7 days' }];
const WORK_MODE_OPTS = [{ id:'wfh',label:'Work from home',icon:'home-outline' },{ id:'office',label:'Work from office',icon:'business-outline' },{ id:'field',label:'Work from field',icon:'location-outline' }];
const WORK_TYPE_OPTS = [{ id:'fulltime',label:'Full time',icon:'briefcase-outline' },{ id:'parttime',label:'Part time',icon:'time-outline' },{ id:'internship',label:'Internship',icon:'school-outline' }];
const SORT_OPTS      = [{ id:'relevant',label:'Relevant' },{ id:'salary-high',label:'Salary - High to low' },{ id:'date-new',label:'Date posted - New to old' }];

// ─── Main Screen ──────────────────────────────────────────────────────────────
const JobsScreen = ({ route, navigation }) => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [jobs,           setJobs]           = useState([]);
  const [companies,      setCompanies]      = useState([]);
  const [industries,     setIndustries]     = useState([]);
  const [departments,    setDepartments]    = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [refreshing,     setRefreshing]     = useState(false);
  const [searchQuery,    setSearchQuery]    = useState(route?.params?.search || '');
  const [locationQuery,  setLocationQuery]  = useState(route?.params?.location || '');
  const [selectedExp,    setSelectedExp]    = useState(route?.params?.experience || 'All Experience');
  const [showExpMenu,    setShowExpMenu]    = useState(false);
  const [showFilterModal,setShowFilterModal]= useState(false);
  const [hasSearched,    setHasSearched]    = useState(false);
  const [activeIndustryTab, setActiveIndustryTab] = useState('All');
  const [events,         setEvents]         = useState([]);
  const [rolesPage,      setRolesPage]      = useState(0); // 0-indexed page for popular roles grid

  // Filter state
  const [datePosted,   setDatePosted]   = useState('all');
  const [minSalary,    setMinSalary]    = useState(0);
  const [workMode,     setWorkMode]     = useState(route?.params?.filterType === 'workMode' ? [route.params.filterValue] : []);
  const [workType,     setWorkType]     = useState(route?.params?.filterType === 'workType' ? [route.params.filterValue] : []);
  const [sortBy,       setSortBy]       = useState('relevant');
  const [selIndustries,setSelIndustries]= useState([]);
  const [selDepts,     setSelDepts]     = useState([]);
  const [indSearch,    setIndSearch]    = useState('');
  const [deptSearch,   setDeptSearch]   = useState('');

  const filterCount = workMode.length + workType.length + selIndustries.length + selDepts.length + (minSalary > 0 ? 1 : 0) + (datePosted !== 'all' ? 1 : 0);

  // ── Data loading ───────────────────────────────────────────────────────────
  const loadInitialData = useCallback(async () => {
    try {
      const [compRes, indRes] = await Promise.allSettled([
        api.getCompanies({ limit: 12 }),
        api.request('/industries'),
      ]);
      if (compRes.status === 'fulfilled' && compRes.value?.companies) setCompanies(compRes.value.companies);
      if (indRes.status === 'fulfilled') {
        const raw = indRes.value;
        if (Array.isArray(raw)) setIndustries(raw.map(i => i.name || i));
        else if (raw?.industries) setIndustries(raw.industries.map(i => i.name || i));
      }
      // Load departments
      try { const dr = await api.getAllDepartments(); if (dr?.data) setDepartments(dr.data); } catch (_) {}
      // Load events
      try {
        const ev = await api.request('/job-events/public?limit=6');
        if (ev?.data?.events) setEvents(ev.data.events);
      } catch (_) {}
    } catch (e) { console.error(e); }
  }, []);

  const loadJobs = useCallback(async (overrideSearch) => {
    try {
      setLoading(true);
      const q = overrideSearch !== undefined ? overrideSearch : searchQuery;
      const filters = {};
      if (q) filters.search = q;
      if (locationQuery) filters.location = locationQuery;
      if (workMode.length) filters.workMode = workMode.map(m => m === 'wfh' ? 'remote' : m).join(',');
      if (workType.length) filters.jobType = workType.map(t => t === 'fulltime' ? 'full-time' : t === 'parttime' ? 'part-time' : t).join(',');
      if (selectedExp !== 'All Experience') filters.experience = selectedExp;
      if (selIndustries.length) filters.industries = selIndustries.join(',');
      if (selDepts.length) filters.departments = selDepts.join(',');
      const res = await api.getJobs(filters);
      setJobs(res.jobs || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, [searchQuery, locationQuery, workMode, workType, selectedExp, selIndustries, selDepts]);

  useEffect(() => { loadInitialData(); }, []);

  useEffect(() => {
    if (route?.params?.search || route?.params?.filterType) {
      setHasSearched(true);
      loadJobs();
    }
  }, [route?.params]);

  const handleSearch = () => {
    setHasSearched(true);
    loadJobs(searchQuery);
  };

  const handleQuickCategory = (cat) => {
    if (cat.filter.search) { setSearchQuery(cat.filter.search); setHasSearched(true); loadJobs(cat.filter.search); }
    else if (cat.filter.workMode) { setWorkMode(cat.filter.workMode); setHasSearched(true); }
  };

  const handleRolePress = (role) => { setSearchQuery(role.title); setHasSearched(true); loadJobs(role.title); };

  const clearAll = () => {
    setDatePosted('all'); setMinSalary(0); setWorkMode([]); setWorkType([]);
    setSortBy('relevant'); setSelIndustries([]); setSelDepts([]);
    setIndSearch(''); setDeptSearch(''); setSearchQuery(''); setLocationQuery('');
    setSelectedExp('All Experience'); setHasSearched(false); setJobs([]);
  };

  const tog = (setter, arr, val) => setter(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

  // ── Sidebar filters ────────────────────────────────────────────────────────
  const renderFilters = (inModal = false) => (
    <View style={[f.wrap, inModal && { borderWidth: 0, shadowOpacity: 0 }]}>
      {!inModal && (
        <View style={f.head}>
          <Text style={f.title}>All Filters</Text>
          <TouchableOpacity onPress={clearAll}><Text style={f.clear}>Clear all</Text></TouchableOpacity>
        </View>
      )}
      {/* Date posted */}
      <View style={f.section}>
        <Text style={f.sTitle}>Date posted</Text>
        {DATE_OPTIONS.map(o => (
          <TouchableOpacity key={o.id} style={f.radioRow} onPress={() => setDatePosted(o.id)}>
            <View style={f.radio}>{datePosted === o.id && <View style={f.radioDot} />}</View>
            <Text style={f.rowLabel}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Work Mode */}
      <View style={f.section}>
        <Text style={f.sTitle}>Work Mode</Text>
        {WORK_MODE_OPTS.map(o => (
          <TouchableOpacity key={o.id} style={f.checkRow} onPress={() => tog(setWorkMode, workMode, o.id)}>
            <View style={[f.cb, workMode.includes(o.id) && f.cbOn]}>{workMode.includes(o.id) && <Ionicons name="checkmark" size={11} color="#fff" />}</View>
            <Ionicons name={o.icon} size={15} color="#64748B" style={{ marginRight: 6 }} />
            <Text style={f.rowLabel}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Work Type */}
      <View style={f.section}>
        <Text style={f.sTitle}>Work Type</Text>
        {WORK_TYPE_OPTS.map(o => (
          <TouchableOpacity key={o.id} style={f.checkRow} onPress={() => tog(setWorkType, workType, o.id)}>
            <View style={[f.cb, workType.includes(o.id) && f.cbOn]}>{workType.includes(o.id) && <Ionicons name="checkmark" size={11} color="#fff" />}</View>
            <Ionicons name={o.icon} size={15} color="#64748B" style={{ marginRight: 6 }} />
            <Text style={f.rowLabel}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Industries */}
      <View style={f.section}>
        <Text style={f.sTitle}>Industries</Text>
        <View style={f.searchRow}>
          <Ionicons name="search-outline" size={13} color="#94A3B8" />
          <TextInput style={f.searchIn} placeholder="Search..." placeholderTextColor="#94A3B8" value={indSearch} onChangeText={setIndSearch} />
        </View>
        <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
          {industries.filter(i => i.toLowerCase().includes(indSearch.toLowerCase())).map((ind, idx) => (
            <TouchableOpacity key={idx} style={f.checkRow} onPress={() => tog(setSelIndustries, selIndustries, ind)}>
              <View style={[f.cb, selIndustries.includes(ind) && f.cbOn]}>{selIndustries.includes(ind) && <Ionicons name="checkmark" size={11} color="#fff" />}</View>
              <Text style={f.rowLabel}>{ind}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {/* Salary */}
      <View style={f.section}>
        <Text style={f.sTitle}>Min Salary</Text>
        <View style={f.salaryPills}>
          {[0,20000,40000,60000,80000,100000].map(v => (
            <TouchableOpacity key={v} style={[f.salPill, minSalary===v && f.salPillOn]} onPress={() => setMinSalary(v)}>
              <Text style={[f.salPillTxt, minSalary===v && f.salPillTxtOn]}>₹{v===0?'Any':v/1000+'K'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {/* Sort */}
      <View style={f.section}>
        <Text style={f.sTitle}>Sort By</Text>
        {SORT_OPTS.map(o => (
          <TouchableOpacity key={o.id} style={f.radioRow} onPress={() => setSortBy(o.id)}>
            <View style={f.radio}>{sortBy === o.id && <View style={f.radioDot} />}</View>
            <Text style={f.rowLabel}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // ── Search Results View ────────────────────────────────────────────────────
  const renderSearchResults = () => (
    <View style={s.body}>
      {/* Sidebar (web only) */}
      {isWeb && (
        <View style={s.sidebarCol}>
          {renderFilters(false)}
        </View>
      )}

      {/* Right column */}
      <View style={s.rightCol}>
        {/* List header */}
        <View style={s.listHead}>
          <Text style={s.showing}>
            {loading ? 'Loading...' : `${jobs.length} job${jobs.length !== 1 ? 's' : ''} found`}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            {hasSearched && (
              <TouchableOpacity onPress={clearAll}>
                <Text style={{ fontSize: 13, color: '#4361EE', fontWeight: '600' }}>Clear</Text>
              </TouchableOpacity>
            )}
            {!isWeb && (
              <TouchableOpacity
                style={[s.filterBtn, filterCount > 0 && s.filterBtnActive]}
                onPress={() => setShowFilterModal(true)}
              >
                <Ionicons name="options-outline" size={15} color={filterCount > 0 ? '#fff' : '#4361EE'} />
                <Text style={[s.filterBtnTxt, filterCount > 0 && { color: '#fff' }]}>
                  Filters{filterCount > 0 ? ` (${filterCount})` : ''}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {loading ? (
          <View style={s.loader}><ActivityIndicator size="large" color="#4361EE" /></View>
        ) : jobs.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="search-outline" size={52} color="#E2E8F0" />
            <Text style={s.emptyTxt}>No jobs found</Text>
            <Text style={s.emptySub}>Try different keywords or filters</Text>
            <TouchableOpacity style={s.clearBtn} onPress={clearAll}>
              <Text style={s.clearBtnTxt}>Clear filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.jobList}>
            {jobs.map((job, idx) => (
              <React.Fragment key={job._id || idx}>
                <JobCard job={job} />
                {idx === 4 && (
                  <AdvertisementWidget position="inline" page="jobs" containerStyle={{ marginVertical: 8 }} />
                )}
              </React.Fragment>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  // ── Discovery Page ─────────────────────────────────────────────────────────
  const renderDiscoveryPage = () => (
    <View>
      {/* Hero */}
      <View style={d.hero}>
        <Text style={d.heroTitle}>Find your dream job now</Text>
        <Text style={d.heroSub}>5 lakh+ jobs for you to explore</Text>

        {/* Search bar */}
        <View style={d.searchCard}>
          <View style={d.searchSeg}>
            <Ionicons name="search-outline" size={18} color="#94A3B8" />
            <TextInput
              style={d.searchIn}
              placeholder="Skills, designations, companies"
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
          {isWeb && <View style={d.divider} />}
          {isWeb && (
            <TouchableOpacity style={d.searchSeg} onPress={() => setShowExpMenu(true)}>
              <Ionicons name="briefcase-outline" size={16} color="#94A3B8" />
              <Text style={[d.searchIn, { color: selectedExp === 'All Experience' ? '#94A3B8' : '#1E293B' }]}>
                {selectedExp}
              </Text>
              <Ionicons name="chevron-down" size={14} color="#94A3B8" />
            </TouchableOpacity>
          )}
          {isWeb && <View style={d.divider} />}
          {isWeb && (
            <View style={d.searchSeg}>
              <Ionicons name="location-outline" size={16} color="#94A3B8" />
              <TextInput
                style={d.searchIn}
                placeholder="Enter location"
                placeholderTextColor="#94A3B8"
                value={locationQuery}
                onChangeText={setLocationQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
            </View>
          )}
          <TouchableOpacity style={d.searchBtn} onPress={handleSearch}>
            <Text style={d.searchBtnTxt}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick category chips — 2-row grid matching Naukri style */}
      <View style={d.catSection}>
        <View style={d.catGrid}>
          {QUICK_CATEGORIES.map(cat => (
            <TouchableOpacity key={cat.id} style={d.catChip} onPress={() => handleQuickCategory(cat)} activeOpacity={0.8}>
              <Ionicons name={cat.icon} size={20} color="#374151" style={d.catIcon} />
              <Text style={d.catLabel} numberOfLines={1}>{cat.label}</Text>
              <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Top companies hiring */}
      <View style={d.section}>
        <Text style={d.sectionTitle}>Top companies hiring now</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 4 }}>
          {TOP_COMPANY_CATEGORIES.map(cat => {
            const active = activeIndustryTab === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[d.topCompCard, active && { borderColor: cat.color, borderWidth: 2 }]}
                onPress={() => { setActiveIndustryTab(cat.id); setSearchQuery(cat.label); setHasSearched(true); loadJobs(cat.label); }}
                activeOpacity={0.8}
              >
                <Text style={[d.topCompLabel, active && { color: cat.color }]}>{cat.label}</Text>
                <Text style={[d.topCompSub, active && { color: cat.color }]}>{cat.sub}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Featured companies */}
      {companies.length > 0 && (
        <View style={d.section}>
          <Text style={d.sectionTitle}>Featured companies actively hiring</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 4 }}>
            {companies.slice(0, 8).map((co, idx) => {
              const name = co.name || 'Company';
              const bg = getAvatarColor(name);
              const rating = co.rating || (3.0 + seedNum(name, 20) / 10).toFixed(1);
              return (
                <View key={co._id || idx} style={d.featCard}>
                  <View style={[d.featLogo, { backgroundColor: bg }]}>
                    <Text style={d.featLogoTxt}>{getInitials(name)}</Text>
                  </View>
                  <Text style={d.featName} numberOfLines={1}>{name}</Text>
                  <View style={d.featRating}>
                    <Ionicons name="star" size={11} color="#16A34A" />
                    <Text style={d.featRatingTxt}>{parseFloat(rating).toFixed(1)}</Text>
                  </View>
                  {co.description ? (
                    <Text style={d.featDesc} numberOfLines={2}>{co.description}</Text>
                  ) : null}
                  <TouchableOpacity style={d.featBtn} onPress={() => setSearchQuery(name)}>
                    <Text style={d.featBtnTxt}>View jobs</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
          <TouchableOpacity style={d.viewAllBtn} onPress={() => navigation.navigate('Companies')}>
            <Text style={d.viewAllTxt}>View all companies</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Discover jobs across popular roles ── */}
      <View style={d.splitSection}>
        {/* Left panel */}
        <View style={d.splitLeft}>
          <View style={d.illustrationBox}>
            <Ionicons name="person-circle-outline" size={72} color="#C7B8EA" />
            <Ionicons name="search-circle-outline" size={40} color="#4361EE" style={{ position: 'absolute', bottom: 8, right: 8 }} />
          </View>
          <Text style={d.splitTitle}>Discover jobs across{'\n'}popular roles</Text>
          <Text style={d.splitSub}>Select a role and we'll show you relevant jobs for it!</Text>
        </View>

        {/* Right panel — paginated 2-col grid */}
        <View style={d.splitRight}>
          {(() => {
            const perPage = 6;
            const totalPages = Math.ceil(POPULAR_ROLES.length / perPage);
            const pageRoles = POPULAR_ROLES.slice(rolesPage * perPage, rolesPage * perPage + perPage);
            return (
              <>
                <View style={d.rolesGrid}>
                  {pageRoles.map((role, idx) => (
                    <TouchableOpacity key={idx} style={d.roleCell} onPress={() => handleRolePress(role)} activeOpacity={0.8}>
                      <Text style={d.roleCellTitle} numberOfLines={2}>{role.title}</Text>
                      <View style={d.roleCellCount}>
                        <Text style={d.roleCellCountTxt}>{role.jobs} Jobs</Text>
                        <Ionicons name="chevron-forward" size={13} color="#4361EE" />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
                {/* Pagination dots */}
                {totalPages > 1 && (
                  <View style={d.dotRow}>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <TouchableOpacity key={i} onPress={() => setRolesPage(i)}>
                        <View style={[d.dot, rolesPage === i && d.dotOn]} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            );
          })()}
        </View>
      </View>

      {/* ── Upcoming events and challenges ── */}
      <View style={d.splitSection}>
        {/* Left panel */}
        <View style={d.splitLeft}>
          <View style={d.illustrationBox}>
            <Ionicons name="calendar-outline" size={64} color="#C7B8EA" />
            <Ionicons name="trophy-outline" size={36} color="#FFB703" style={{ position: 'absolute', bottom: 8, right: 8 }} />
          </View>
          <Text style={d.splitTitle}>Upcoming events and{'\n'}challenges</Text>
          <Text style={d.splitSub}>Participate in hiring challenges and job fairs near you!</Text>
        </View>

        {/* Right panel — horizontal scroll of event cards */}
        <View style={d.splitRight}>
          {events.length === 0 ? (
            <View style={d.evtEmpty}>
              <Ionicons name="calendar-outline" size={40} color="#E2E8F0" />
              <Text style={{ fontSize: 13, color: '#94A3B8', marginTop: 8 }}>No upcoming events</Text>
              <TouchableOpacity style={[d.viewAllBtn, { marginTop: 12 }]} onPress={() => navigation.navigate('JobEvents')}>
                <Text style={d.viewAllTxt}>Browse all events</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {events.map((ev, idx) => {
                  const daysLeft = ev.startDate ? Math.max(0, Math.ceil((new Date(ev.startDate) - Date.now()) / 86400000)) : null;
                  const typeLabel = ev.eventType === 'recruitment_drive' ? 'Hiring challenge' : ev.eventType === 'job_fair' ? 'Job fair' : ev.eventType === 'webinar' ? 'Webinar' : 'Event';
                  const enrolled = ev.registrationCount || seedNum(ev.title || 'e', 2000, 50);
                  return (
                    <View key={ev._id || idx} style={d.evtCard}>
                      {/* Banner */}
                      <View style={d.evtBanner}>
                        {daysLeft !== null && daysLeft >= 0 && (
                          <View style={d.evtCountdown}>
                            <Text style={d.evtCountdownTxt}>Entry closes in {daysLeft}d</Text>
                          </View>
                        )}
                        <View style={d.evtTypeBadge}>
                          <Text style={d.evtTypeTxt}>{typeLabel}</Text>
                        </View>
                        <Ionicons name="calendar" size={36} color="rgba(255,255,255,0.3)" style={{ alignSelf: 'center', marginTop: 8 }} />
                      </View>
                      {/* Body */}
                      <View style={d.evtBody}>
                        <View style={d.evtOrgRow}>
                          <View style={[d.evtOrgLogo, { backgroundColor: getAvatarColor(ev.organizerName || 'E') }]}>
                            <Text style={d.evtOrgLogoTxt}>{getInitials(ev.organizerName || 'E')}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={d.evtTitle} numberOfLines={2}>{ev.title}</Text>
                            <Text style={d.evtOrg} numberOfLines={1}>{ev.organizerName}</Text>
                          </View>
                        </View>
                        {ev.skills && ev.skills.length > 0 && (
                          <View style={d.evtSkills}>
                            {ev.skills.slice(0, 3).map((sk, si) => (
                              <Text key={si} style={d.evtSkillTxt}>{sk}{si < Math.min(ev.skills.length, 3) - 1 ? '  ' : ''}</Text>
                            ))}
                          </View>
                        )}
                        <View style={d.evtMeta}>
                          <Ionicons name="calendar-outline" size={12} color="#64748B" />
                          <Text style={d.evtMetaTxt}>
                            {ev.startDate ? new Date(ev.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'TBD'}
                            {ev.startTime ? `, ${ev.startTime}` : ''}
                          </Text>
                          <Ionicons name="people-outline" size={12} color="#64748B" style={{ marginLeft: 10 }} />
                          <Text style={d.evtMetaTxt}>{enrolled.toLocaleString()} Enrolled</Text>
                        </View>
                        <View style={d.evtFooter}>
                          <View style={d.evtOfferBadge}>
                            <Ionicons name="briefcase-outline" size={11} color="#4361EE" />
                            <Text style={d.evtOfferTxt}>Job offer</Text>
                          </View>
                          <TouchableOpacity onPress={() => navigation.navigate('JobEvents')}>
                            <Text style={d.evtViewTxt}>View details</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
              <TouchableOpacity style={[d.viewAllBtn, { alignSelf: 'flex-start', marginTop: 14 }]} onPress={() => navigation.navigate('JobEvents')}>
                <Text style={d.viewAllTxt}>View all events ›</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* ── Prepare for your next interview ── */}
      <View style={d.interviewSection}>
        {/* Left illustration */}
        <View style={[d.splitLeft, { backgroundColor: '#FFF7ED', borderRadius: 16, padding: 20 }]}>
          <Text style={d.interviewByLine}>by AmbitionBox</Text>
          <View style={d.illustrationBox}>
            <Ionicons name="chatbubbles-outline" size={64} color="#FBB040" />
            <Ionicons name="person-outline" size={40} color="#C7B8EA" style={{ position: 'absolute', bottom: 4, right: 4 }} />
          </View>
          <Text style={d.splitTitle}>Prepare for your next{'\n'}interview</Text>
        </View>

        {/* Middle — by company */}
        <View style={d.interviewPanel}>
          <Text style={d.interviewPanelTitle}>Interview questions by company</Text>
          <View style={d.interviewGrid}>
            {companies.slice(0, 6).map((co, idx) => {
              const name = co.name || 'Company';
              const bg = getAvatarColor(name);
              const interviews = seedNum(name, 2500, 400);
              return (
                <TouchableOpacity key={co._id || idx} style={d.interviewCompRow} activeOpacity={0.8}
                  onPress={() => navigation.navigate('CompanyDetails', { companyId: co._id, company: co })}>
                  <View style={[d.interviewCompLogo, { backgroundColor: bg }]}>
                    <Text style={d.interviewCompLogoTxt}>{getInitials(name)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={d.interviewCompName} numberOfLines={1}>{name}</Text>
                    <Text style={d.interviewCompCount}>{interviews.toLocaleString()}+ Interviews</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color="#CBD5E0" />
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity style={d.interviewViewAll} onPress={() => navigation.navigate('Companies')}>
            <Text style={d.interviewViewAllTxt}>View all companies ›</Text>
          </TouchableOpacity>
        </View>

        {/* Right — by role */}
        <View style={d.interviewPanel}>
          <Text style={d.interviewPanelTitle}>Interview questions by role</Text>
          {[
            { role: 'Software Engineer',  count: '7.2K+' },
            { role: 'Business Analyst',   count: '2.8K+' },
            { role: 'Consultant',         count: '2.4K+' },
            { role: 'Financial Analyst',  count: '894' },
            { role: 'Sales & Marketing',  count: '991' },
            { role: 'Quality Engineer',   count: '1.3K+' },
          ].map((item, idx) => (
            <TouchableOpacity key={idx} style={d.interviewRoleRow} activeOpacity={0.8}
              onPress={() => handleRolePress({ title: item.role })}>
              <Text style={d.interviewRoleName}>{item.role}</Text>
              <Text style={d.interviewRoleCount}>({item.count} questions)</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={d.interviewViewAll}>
            <Text style={d.interviewViewAllTxt}>View all roles ›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Sponsored companies ── */}
      {companies.length > 0 && (
        <View style={d.section}>
          <Text style={[d.sectionTitle, { textAlign: 'center' }]}>Sponsored companies</Text>
          {/* Industry tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 16 }}>
            {INDUSTRY_TABS.map(tab => (
              <TouchableOpacity
                key={tab}
                style={[d.indTab, activeIndustryTab === tab && d.indTabOn]}
                onPress={() => setActiveIndustryTab(tab)}
              >
                <Text style={[d.indTabTxt, activeIndustryTab === tab && d.indTabTxtOn]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* 4-col grid */}
          <View style={d.sponsGrid}>
            {companies.slice(0, 8).map((co, idx) => {
              const name = co.name || 'Company';
              const bg = getAvatarColor(name);
              const rating = co.rating || (3.0 + seedNum(name, 20) / 10).toFixed(1);
              return (
                <TouchableOpacity key={co._id || idx} style={d.sponsCard} activeOpacity={0.85}
                  onPress={() => navigation.navigate('CompanyDetails', { companyId: co._id, company: co })}>
                  <View style={[d.sponsLogo, { backgroundColor: bg }]}>
                    <Text style={d.sponsLogoTxt}>{getInitials(name)}</Text>
                  </View>
                  <Text style={d.sponsName} numberOfLines={1}>{name}</Text>
                  <View style={d.sponsRating}>
                    <Ionicons name="star" size={10} color="#16A34A" />
                    <Text style={d.sponsRatingTxt}>{parseFloat(rating).toFixed(1)}</Text>
                  </View>
                  {co.industry ? <Text style={d.sponsTag} numberOfLines={1}>{co.industry}</Text> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      <AdvertisementWidget position="footer" page="jobs" containerStyle={{ marginHorizontal: 16, marginBottom: 16 }} />
    </View>
  );

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      <Header />

      {/* Sticky search bar on results page */}
      {hasSearched && (
        <View style={s.stickySearch}>
          <View style={s.stickyBar}>
            <Ionicons name="search-outline" size={16} color="#94A3B8" />
            <TextInput
              style={s.stickyIn}
              placeholder="Job title, skills, company..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => { setSearchQuery(''); }}>
                <Ionicons name="close-circle" size={16} color="#CBD5E0" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={s.stickyBtn} onPress={handleSearch}>
            <Text style={s.stickyBtnTxt}>Search</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); hasSearched ? loadJobs() : loadInitialData().finally(() => setRefreshing(false)); }} />}
      >
        {hasSearched ? renderSearchResults() : renderDiscoveryPage()}
      </ScrollView>

      {/* Mobile filter modal */}
      <Modal visible={showFilterModal} animationType="slide" transparent onRequestClose={() => setShowFilterModal(false)}>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.sheetHead}>
              <Text style={s.sheetTitle}>All Filters</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={22} color="#1E293B" />
              </TouchableOpacity>
            </View>
            <ScrollView>{renderFilters(true)}</ScrollView>
            <TouchableOpacity style={s.applyBtn} onPress={() => { setShowFilterModal(false); setHasSearched(true); loadJobs(); }}>
              <Text style={s.applyTxt}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Experience dropdown modal */}
      <Modal visible={showExpMenu} animationType="fade" transparent onRequestClose={() => setShowExpMenu(false)}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setShowExpMenu(false)}>
          <View style={s.expMenu}>
            {EXPERIENCE_OPTIONS.map(opt => (
              <TouchableOpacity key={opt} style={[s.expOpt, selectedExp === opt && s.expOptOn]}
                onPress={() => { setSelectedExp(opt); setShowExpMenu(false); }}>
                <Text style={[s.expOptTxt, selectedExp === opt && { color: '#4361EE', fontWeight: '700' }]}>{opt}</Text>
                {selectedExp === opt && <Ionicons name="checkmark" size={15} color="#4361EE" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#F1F5F9' },
  scroll: { flex: 1 },

  // Sticky search
  stickySearch: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  stickyBar:    { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 9, borderWidth: 1.5, borderColor: '#E2E8F0', paddingHorizontal: 12, paddingVertical: 9, gap: 8 },
  stickyIn:     { flex: 1, fontSize: 14, color: '#1E293B', outlineStyle: 'none' },
  stickyBtn:    { backgroundColor: '#4361EE', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 9 },
  stickyBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // Body layout
  body:       { flexDirection: isWeb ? 'row' : 'column', alignItems: 'flex-start', padding: isWeb ? 24 : 0, paddingTop: 20, gap: isWeb ? 24 : 0 },
  sidebarCol: { width: 256, flexShrink: 0 },
  rightCol:   { flex: 1, minWidth: 0, paddingHorizontal: isWeb ? 0 : 12 },

  // List header
  listHead:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  showing:    { fontSize: 14, color: '#64748B', fontWeight: '500' },
  filterBtn:  { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5, borderColor: '#4361EE' },
  filterBtnActive: { backgroundColor: '#4361EE' },
  filterBtnTxt: { fontSize: 13, fontWeight: '600', color: '#4361EE' },

  // Job list
  jobList: { gap: 12 },

  // States
  loader:    { paddingVertical: 80, alignItems: 'center' },
  empty:     { alignItems: 'center', paddingVertical: 80 },
  emptyTxt:  { fontSize: 16, fontWeight: '600', color: '#475569', marginTop: 14 },
  emptySub:  { fontSize: 13, color: '#94A3B8', marginTop: 4 },
  clearBtn:  { marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, borderWidth: 1.5, borderColor: '#4361EE' },
  clearBtnTxt: { fontSize: 14, color: '#4361EE', fontWeight: '600' },

  // Modal
  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet:     { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '88%' },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: '#1E293B' },
  applyBtn:  { margin: 16, backgroundColor: '#4361EE', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  applyTxt:  { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Experience dropdown
  expMenu:   { backgroundColor: '#fff', borderRadius: 12, margin: 24, marginTop: 'auto', overflow: 'hidden', ...shadows.md },
  expOpt:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  expOptOn:  { backgroundColor: '#EEF2FF' },
  expOptTxt: { fontSize: 14, color: '#374151' },
});

// Filters sidebar styles
const f = StyleSheet.create({
  wrap:     { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden', ...shadows.xs },
  head:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  title:    { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  clear:    { fontSize: 13, color: '#4361EE', fontWeight: '600' },
  section:  { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  sTitle:   { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 10 },
  radioRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 9 },
  radio:    { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: '#CBD5E0', alignItems: 'center', justifyContent: 'center', marginRight: 9 },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4361EE' },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 9 },
  cb:       { width: 16, height: 16, borderRadius: 4, borderWidth: 1.5, borderColor: '#CBD5E0', alignItems: 'center', justifyContent: 'center', marginRight: 9 },
  cbOn:     { backgroundColor: '#4361EE', borderColor: '#4361EE' },
  rowLabel: { fontSize: 13, color: '#374151', flex: 1 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 7, paddingHorizontal: 8, paddingVertical: 6, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  searchIn:  { flex: 1, fontSize: 12, color: '#1E293B', marginLeft: 5, outlineStyle: 'none' },
  salaryPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 4 },
  salPill:    { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
  salPillOn:  { backgroundColor: '#EEF2FF', borderColor: '#4361EE' },
  salPillTxt: { fontSize: 12, color: '#475569', fontWeight: '500' },
  salPillTxtOn: { color: '#4361EE', fontWeight: '700' },
});

// Discovery page styles
const d = StyleSheet.create({
  // Hero
  hero:        { backgroundColor: '#EEF2FF', paddingHorizontal: isWeb ? 48 : 20, paddingTop: isWeb ? 56 : 36, paddingBottom: isWeb ? 56 : 40, alignItems: 'center' },
  heroTitle:   { fontSize: isWeb ? 36 : 26, fontWeight: '800', color: '#0F172A', textAlign: 'center', letterSpacing: -0.5, marginBottom: 8 },
  heroSub:     { fontSize: isWeb ? 16 : 14, color: '#64748B', textAlign: 'center', marginBottom: 28 },
  searchCard:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', overflow: 'hidden', width: '100%', maxWidth: 780, ...shadows.md },
  searchSeg:   { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  searchIn:    { flex: 1, fontSize: 14, color: '#1E293B', outlineStyle: 'none' },
  divider:     { width: 1, height: 28, backgroundColor: '#E2E8F0' },
  searchBtn:   { backgroundColor: '#4361EE', paddingHorizontal: 28, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  searchBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Sections
  section:      { paddingHorizontal: isWeb ? 48 : 16, paddingVertical: 28 },
  sectionTitle: { fontSize: isWeb ? 20 : 17, fontWeight: '800', color: '#0F172A', marginBottom: 16, letterSpacing: -0.3 },

  // Category grid (Naukri-style 2-row)
  catSection: { backgroundColor: '#fff', paddingHorizontal: isWeb ? 48 : 16, paddingVertical: 28 },
  catGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: isWeb ? 12 : 8 },
  catChip:    {
    flexDirection: 'row', alignItems: 'center',
    width: isWeb ? 'calc(20% - 10px)' : '47%',
    backgroundColor: '#fff',
    borderRadius: 10, borderWidth: 1.5, borderColor: '#E2E8F0',
    paddingHorizontal: 14, paddingVertical: 16,
    gap: 10,
    ...shadows.xs,
  },
  catIcon:    { flexShrink: 0 },
  catLabel:   { flex: 1, fontSize: 14, fontWeight: '600', color: '#1E293B' },

  // Top company cards
  topCompCard:  { paddingHorizontal: 18, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#fff', minWidth: 160, ...shadows.xs },
  topCompLabel: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 3 },
  topCompSub:   { fontSize: 12, color: '#4361EE', fontWeight: '500' },

  // Featured company cards
  featCard:    { width: 180, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, alignItems: 'center', ...shadows.sm },
  featLogo:    { width: 56, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  featLogoTxt: { fontSize: 20, fontWeight: '800', color: '#fff' },
  featName:    { fontSize: 14, fontWeight: '700', color: '#0F172A', textAlign: 'center', marginBottom: 6 },
  featRating:  { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 8 },
  featRatingTxt: { fontSize: 12, fontWeight: '600', color: '#16A34A' },
  featDesc:    { fontSize: 12, color: '#64748B', textAlign: 'center', lineHeight: 17, marginBottom: 12 },
  featBtn:     { borderWidth: 1.5, borderColor: '#4361EE', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 7, marginTop: 'auto' },
  featBtnTxt:  { fontSize: 13, color: '#4361EE', fontWeight: '600' },

  // View all button
  viewAllBtn: { alignSelf: 'center', marginTop: 16, paddingHorizontal: 28, paddingVertical: 11, borderRadius: 10, borderWidth: 1.5, borderColor: '#4361EE' },
  viewAllTxt: { fontSize: 14, color: '#4361EE', fontWeight: '700' },

  // Popular roles
  rolesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  roleCard:  { width: isWeb ? 'calc(25% - 8px)' : '47%', backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, ...shadows.xs },
  roleTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  roleCount: { fontSize: 13, color: '#4361EE', fontWeight: '600' },

  // Industry tabs
  indTab:    { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#fff' },
  indTabOn:  { backgroundColor: '#4361EE', borderColor: '#4361EE' },
  indTabTxt: { fontSize: 13, color: '#475569', fontWeight: '500' },
  indTabTxtOn: { color: '#fff', fontWeight: '700' },

  // Sponsored grid
  sponsGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sponsCard:    { width: isWeb ? 'calc(25% - 8px)' : '47%', backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 14, alignItems: 'center', ...shadows.xs },
  sponsLogo:    { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  sponsLogoTxt: { fontSize: 16, fontWeight: '800', color: '#fff' },
  sponsName:    { fontSize: 13, fontWeight: '700', color: '#0F172A', textAlign: 'center', marginBottom: 4 },
  sponsRating:  { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 4 },
  sponsRatingTxt: { fontSize: 11, fontWeight: '600', color: '#16A34A' },
  sponsTag:     { fontSize: 11, color: '#64748B', textAlign: 'center' },

  // ── Split section (roles / events) ──
  splitSection: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: 16,
    paddingHorizontal: isWeb ? 48 : 16,
    paddingVertical: 28,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  splitLeft: {
    width: isWeb ? 220 : '100%',
    backgroundColor: '#FFF5F0',
    borderRadius: 16,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'flex-start',
    flexShrink: 0,
  },
  illustrationBox: {
    width: 100, height: 100,
    backgroundColor: '#EDE9FE',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  splitTitle: { fontSize: isWeb ? 18 : 16, fontWeight: '800', color: '#0F172A', lineHeight: 26, marginBottom: 8 },
  splitSub:   { fontSize: 13, color: '#64748B', lineHeight: 19 },
  splitRight: { flex: 1 },

  // Roles grid (paginated)
  rolesGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  roleCell:     {
    width: isWeb ? 'calc(50% - 5px)' : '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  roleCellTitle:    { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 8, lineHeight: 20 },
  roleCellCount:    { flexDirection: 'row', alignItems: 'center', gap: 2 },
  roleCellCountTxt: { fontSize: 13, color: '#4361EE', fontWeight: '600' },
  dotRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 14 },
  dot:    { width: 8, height: 8, borderRadius: 4, backgroundColor: '#CBD5E0' },
  dotOn:  { backgroundColor: '#4361EE', width: 20 },

  // Event cards
  evtEmpty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  evtCard:  {
    width: isWeb ? 260 : 230,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  evtBanner: {
    backgroundColor: '#1E3A5F',
    height: 90,
    padding: 10,
    justifyContent: 'space-between',
  },
  evtCountdown: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  evtCountdownTxt: { fontSize: 11, color: '#fff', fontWeight: '600' },
  evtTypeBadge: {
    backgroundColor: '#4361EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-end',
  },
  evtTypeTxt: { fontSize: 10, color: '#fff', fontWeight: '700' },
  evtBody:    { padding: 12 },
  evtOrgRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  evtOrgLogo: { width: 32, height: 32, borderRadius: 6, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  evtOrgLogoTxt: { fontSize: 12, fontWeight: '800', color: '#fff' },
  evtTitle:   { fontSize: 13, fontWeight: '700', color: '#0F172A', lineHeight: 18 },
  evtOrg:     { fontSize: 11, color: '#64748B', marginTop: 2 },
  evtSkills:  { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  evtSkillTxt: { fontSize: 11, color: '#475569' },
  evtMeta:    { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  evtMetaTxt: { fontSize: 11, color: '#64748B' },
  evtFooter:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10 },
  evtOfferBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  evtOfferTxt:   { fontSize: 11, color: '#4361EE', fontWeight: '600' },
  evtViewTxt:    { fontSize: 12, color: '#4361EE', fontWeight: '700' },

  // Interview section
  interviewSection: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: 16,
    paddingHorizontal: isWeb ? 48 : 16,
    paddingVertical: 28,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  interviewByLine: { fontSize: 11, color: '#94A3B8', fontWeight: '600', marginBottom: 12 },
  interviewPanel: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  interviewPanelTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 14 },
  interviewGrid:       { gap: 2 },
  interviewCompRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  interviewCompLogo:   { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  interviewCompLogoTxt: { fontSize: 12, fontWeight: '800', color: '#fff' },
  interviewCompName:   { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  interviewCompCount:  { fontSize: 12, color: '#64748B' },
  interviewRoleRow:    { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  interviewRoleName:   { fontSize: 13, fontWeight: '600', color: '#0F172A', flex: 1 },
  interviewRoleCount:  { fontSize: 12, color: '#64748B' },
  interviewViewAll:    { marginTop: 12 },
  interviewViewAllTxt: { fontSize: 13, color: '#4361EE', fontWeight: '700' },
});

export default JobsScreen;
