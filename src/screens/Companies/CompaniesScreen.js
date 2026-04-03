import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, ScrollView, TextInput, StyleSheet,
  ActivityIndicator, RefreshControl, TouchableOpacity, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { shadows } from '../../styles/theme';
import Header from '../../components/Header';
import AdvertisementWidget from '../../components/AdvertisementWidget';
import api from '../../config/api';
import { useNavigation } from '@react-navigation/native';

const getPlatform = () => {
  try { const { Platform } = require('react-native'); if (Platform?.OS) return Platform; } catch (e) {}
  return { OS: 'android' };
};
const isWeb = getPlatform().OS === 'web';

// ─── Constants ────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ['#4361EE','#3A86FF','#06D6A0','#FFB703','#EF233C','#7B2FBE','#F72585','#4CC9F0'];
const getInitials = (n) => { if (!n) return 'C'; const w = n.trim().split(' '); return w.length >= 2 ? (w[0][0]+w[1][0]).toUpperCase() : n.slice(0,2).toUpperCase(); };
const getAvatarColor = (n) => AVATAR_COLORS[(n||'C').charCodeAt(0) % AVATAR_COLORS.length];
const seedNum = (n, max, min = 0) => { const s = (n||'x').split('').reduce((a,c)=>a+c.charCodeAt(0),0); return min + (s % (max - min)); };

const MNC_CATEGORIES = [
  { id: 'all',        label: 'All Companies',  sub: 'Browse all',      color: '#4361EE' },
  { id: 'mnc',        label: 'MNCs',           sub: '2.3K+ Companies', color: '#3A86FF' },
  { id: 'startup',    label: 'Startups',       sub: '807 Companies',   color: '#EF233C' },
  { id: 'it',         label: 'IT Services',    sub: '1.2K+ Companies', color: '#06D6A0' },
  { id: 'healthcare', label: 'Healthcare',     sub: '709 Companies',   color: '#FFB703' },
  { id: 'fintech',    label: 'FinTech',        sub: '252 Companies',   color: '#7B2FBE' },
  { id: 'edtech',     label: 'EdTech',         sub: '171 Companies',   color: '#F72585' },
  { id: 'ecommerce',  label: 'E-Commerce',     sub: '340 Companies',   color: '#4CC9F0' },
];

const COMPANY_TYPES = ['Corporate', 'Foreign MNC', 'Startup', 'Indian MNC', 'Consultancy'];
const LOCATIONS     = ['Bengaluru', 'Delhi/NCR', 'Mumbai', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad'];
const EXPERIENCE_LEVELS = ['Experienced', 'Entry Level', 'Internship'];
const BUSINESS_TYPES    = ['B2B', 'B2C', 'SaaS', 'D2C'];
const JOB_DATE_OPTIONS  = ['< 7 Days', '< 15 Days', '< 30 Days'];
const PAGE_SIZE = 10;

// ─── Sidebar sub-components ───────────────────────────────────────────────────
const CheckboxGroup = ({ title, items, selected, onToggle, searchable, counts }) => {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const filtered = searchable ? items.filter(i => i.toLowerCase().includes(q.toLowerCase())) : items;
  const visible = open ? filtered : filtered.slice(0, 5);
  return (
    <View style={sf.group}>
      <TouchableOpacity style={sf.groupHeader} onPress={() => setOpen(o => !o)}>
        <Text style={sf.groupTitle}>{title}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={14} color="#64748B" />
      </TouchableOpacity>
      {searchable && (
        <View style={sf.searchRow}>
          <Ionicons name="search-outline" size={13} color="#94A3B8" />
          <TextInput style={sf.searchIn} placeholder={`Search ${title}`} placeholderTextColor="#94A3B8" value={q} onChangeText={setQ} />
        </View>
      )}
      {visible.map(item => (
        <TouchableOpacity key={item} style={sf.row} onPress={() => onToggle(item)}>
          <View style={[sf.cb, selected.includes(item) && sf.cbOn]}>
            {selected.includes(item) && <Ionicons name="checkmark" size={10} color="#fff" />}
          </View>
          <Text style={sf.rowLabel}>{item}</Text>
          {counts && counts[item] ? <Text style={sf.count}>({counts[item]})</Text> : null}
        </TouchableOpacity>
      ))}
      {filtered.length > 5 && (
        <TouchableOpacity onPress={() => setOpen(o => !o)}>
          <Text style={sf.more}>{open ? '− Less' : `+ ${filtered.length - 5} more`}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const PillGroup = ({ title, items, selected, onToggle }) => (
  <View style={sf.group}>
    <Text style={sf.groupTitle}>{title}</Text>
    <View style={sf.pills}>
      {items.map(item => (
        <TouchableOpacity key={item} style={[sf.pill, selected.includes(item) && sf.pillOn]} onPress={() => onToggle(item)}>
          <Text style={[sf.pillTxt, selected.includes(item) && sf.pillTxtOn]}>{item}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const SidebarFilters = ({ filters, industries, onChange, onClear }) => {
  const tog = (key, val) => { const c = filters[key]||[]; onChange(key, c.includes(val) ? c.filter(x=>x!==val) : [...c,val]); };
  return (
    <ScrollView style={sf.wrap} showsVerticalScrollIndicator={false}>
      <View style={sf.topRow}>
        <Text style={sf.title}>All Filters</Text>
        <TouchableOpacity onPress={onClear}><Text style={sf.clear}>Clear all</Text></TouchableOpacity>
      </View>
      <CheckboxGroup title="Company type" items={COMPANY_TYPES} selected={filters.companyTypes||[]} onToggle={v=>tog('companyTypes',v)} />
      <CheckboxGroup title="Location" items={LOCATIONS} selected={filters.locations||[]} onToggle={v=>tog('locations',v)} searchable />
      <CheckboxGroup title="Industry" items={industries.length ? industries : ['Technology','Finance','Healthcare','Education','Manufacturing']} selected={filters.industries||[]} onToggle={v=>tog('industries',v)} searchable />
      <PillGroup title="Experience" items={EXPERIENCE_LEVELS} selected={filters.experience||[]} onToggle={v=>tog('experience',v)} />
      <PillGroup title="Nature of business" items={BUSINESS_TYPES} selected={filters.businessTypes||[]} onToggle={v=>tog('businessTypes',v)} />
      <PillGroup title="Job posting date" items={JOB_DATE_OPTIONS} selected={filters.jobDate||[]} onToggle={v=>tog('jobDate',v)} />
    </ScrollView>
  );
};

// ─── Company Card ─────────────────────────────────────────────────────────────
const CompanyCard = ({ company, onPress }) => {
  const name    = company.name || 'Company';
  const bg      = getAvatarColor(name);
  const rating  = company.rating  || (3.0 + seedNum(name, 20) / 10).toFixed(1);
  const reviews = company.reviews || seedNum(name, 500, 10);

  const tags = [];
  if (company.companyType)    tags.push(company.companyType);
  if (company.industry)       tags.push(company.industry);
  if (company.establishedYear) tags.push(`Founded: ${company.establishedYear}`);

  return (
    <TouchableOpacity style={cc.card} onPress={onPress} activeOpacity={0.85}>
      {/* Logo */}
      <View style={[cc.logo, { backgroundColor: bg }]}>
        <Text style={cc.logoTxt}>{getInitials(name)}</Text>
      </View>

      {/* Body */}
      <View style={cc.body}>
        <View style={cc.nameRow}>
          <Text style={cc.name} numberOfLines={1}>{name}</Text>
          {company.isEmployerVerified && (
            <Ionicons name="checkmark-circle" size={13} color="#10B981" style={{ marginLeft: 4 }} />
          )}
        </View>

        {/* Rating row */}
        <View style={cc.ratingRow}>
          <View style={cc.ratingBadge}>
            <Text style={cc.ratingNum}>{parseFloat(rating).toFixed(1)}</Text>
            <Ionicons name="star" size={9} color="#fff" style={{ marginLeft: 2 }} />
          </View>
          <Text style={cc.reviewTxt}>{reviews} reviews</Text>
        </View>

        {/* Tag row */}
        <View style={cc.tagRow}>
          {tags.map((t, i) => (
            <React.Fragment key={t}>
              {i > 0 && <Text style={cc.sep}>·</Text>}
              <Text style={cc.tag}>{t}</Text>
            </React.Fragment>
          ))}
        </View>

        {/* Open jobs */}
        {company.openPositions > 0 && (
          <View style={cc.jobsBadge}>
            <Ionicons name="briefcase-outline" size={11} color="#4361EE" />
            <Text style={cc.jobsTxt}>{company.openPositions} open jobs</Text>
          </View>
        )}
      </View>

      <Ionicons name="chevron-forward" size={15} color="#CBD5E0" style={{ alignSelf: 'center' }} />
    </TouchableOpacity>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CompaniesScreen() {
  const navigation = useNavigation();
  const [companies,    setCompanies]    = useState([]);
  const [industries,   setIndustries]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [search,       setSearch]       = useState('');
  const [searchInput,  setSearchInput]  = useState('');
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [total,        setTotal]        = useState(0);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showModal,    setShowModal]    = useState(false);
  const [filters, setFilters] = useState({ companyTypes:[], locations:[], industries:[], experience:[], businessTypes:[], jobDate:[] });

  const fetchCompanies = useCallback(async (pg = 1, q = search, reset = false) => {
    try {
      if (pg === 1) setLoading(true);
      const params = { page: pg, limit: PAGE_SIZE };
      if (q) params.search = q;
      if (filters.industries.length === 1) params.industry = filters.industries[0];
      const res = await api.request('/company?' + new URLSearchParams(params).toString());
      if (res.success) {
        const list = res.companies || [];
        setCompanies(prev => (pg === 1 || reset) ? list : [...prev, ...list]);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotal(res.pagination?.total || list.length);
        setPage(pg);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, [search, filters]);

  useEffect(() => { fetchCompanies(1, search, true); }, [search, filters]);

  useEffect(() => {
    api.request('/industries').then(res => {
      if (Array.isArray(res)) setIndustries(res.map(i => i.name || i));
      else if (res?.industries) setIndustries(res.industries.map(i => i.name || i));
    }).catch(() => {});
  }, []);

  const onRefresh = () => { setRefreshing(true); fetchCompanies(1, search, true); };
  const handleSearch = () => setSearch(searchInput);

  const handleCategory = (cat) => {
    setActiveCategory(cat.id);
    if (cat.id === 'all') { setFilters(f => ({ ...f, companyTypes: [], industries: [] })); return; }
    const typeMap = { mnc: 'Foreign MNC', startup: 'Startup', it: 'Corporate', healthcare: 'Corporate', fintech: 'Corporate', edtech: 'Corporate', ecommerce: 'Corporate' };
    const indMap  = { it: 'IT Services', healthcare: 'Healthcare', fintech: 'Finance', edtech: 'Education', ecommerce: 'E-Commerce' };
    setFilters(f => ({ ...f, companyTypes: typeMap[cat.id] ? [typeMap[cat.id]] : [], industries: indMap[cat.id] ? [indMap[cat.id]] : [] }));
  };

  const filtered = useMemo(() => {
    let list = companies;
    if (filters.companyTypes.length) list = list.filter(c => filters.companyTypes.some(t => (c.companyType||'').toLowerCase().includes(t.toLowerCase())));
    if (filters.locations.length)    list = list.filter(c => filters.locations.some(l => (c.location||'').toLowerCase().includes(l.toLowerCase())));
    if (filters.industries.length > 1) list = list.filter(c => filters.industries.some(i => (c.industry||'').toLowerCase().includes(i.toLowerCase())));
    return list;
  }, [companies, filters]);

  const filterCount = Object.values(filters).reduce((a, v) => a + v.length, 0);
  const setFilter   = (key, val) => setFilters(f => ({ ...f, [key]: val }));
  const clearFilters = () => { setFilters({ companyTypes:[], locations:[], industries:[], experience:[], businessTypes:[], jobDate:[] }); setActiveCategory('all'); };

  return (
    <View style={s.root}>
      <Header />
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

        {/* ── Hero ── */}
        <View style={s.hero}>
          <Text style={s.heroEye}>EXPLORE COMPANIES</Text>
          <Text style={s.heroTitle}>Top companies hiring now</Text>
          <Text style={s.heroSub}>{total > 0 ? `${total.toLocaleString()} companies` : 'Thousands of companies'} across India</Text>
          <View style={s.searchWrap}>
            <View style={s.searchBar}>
              <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
              <TextInput
                style={s.searchIn}
                placeholder="Search company name or industry..."
                placeholderTextColor="#94A3B8"
                value={searchInput}
                onChangeText={setSearchInput}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              {searchInput.length > 0 && (
                <TouchableOpacity onPress={() => { setSearchInput(''); setSearch(''); }}>
                  <Ionicons name="close-circle" size={17} color="#CBD5E0" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity style={s.searchBtn} onPress={handleSearch}>
              <Text style={s.searchBtnTxt}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── MNC Category Strip ── */}
        <View style={s.catSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catScroll}>
            {MNC_CATEGORIES.map(cat => {
              const active = activeCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[s.catCard, active && { borderColor: cat.color, borderWidth: 2 }]}
                  onPress={() => handleCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.catLabel, active && { color: cat.color }]}>{cat.label}</Text>
                  <Text style={[s.catSub, active && { color: cat.color }]}>{cat.sub} →</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <AdvertisementWidget position="header" page="companies" containerStyle={{ marginHorizontal: 16, marginTop: 4, marginBottom: 0 }} />

        {/* ── Body: sidebar + grid ── */}
        <View style={s.body}>

          {/* Sidebar (web only) */}
          {isWeb && (
            <View style={s.sidebarCol}>
              <SidebarFilters filters={filters} industries={industries} onChange={setFilter} onClear={clearFilters} />
            </View>
          )}

          {/* Right column */}
          <View style={s.rightCol}>

            {/* List header */}
            <View style={s.listHead}>
              <Text style={s.showing}>Showing {filtered.length} companies</Text>
              {!isWeb && (
                <TouchableOpacity style={[s.filterBtn, filterCount > 0 && s.filterBtnActive]} onPress={() => setShowModal(true)}>
                  <Ionicons name="options-outline" size={15} color={filterCount > 0 ? '#fff' : '#4361EE'} />
                  <Text style={[s.filterBtnTxt, filterCount > 0 && { color: '#fff' }]}>
                    Filters{filterCount > 0 ? ` (${filterCount})` : ''}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Cards */}
            {loading ? (
              <View style={s.loader}><ActivityIndicator size="large" color="#4361EE" /></View>
            ) : filtered.length === 0 ? (
              <View style={s.empty}>
                <Ionicons name="business-outline" size={52} color="#E2E8F0" />
                <Text style={s.emptyTxt}>No companies found</Text>
                <Text style={s.emptySub}>Try adjusting your search or filters</Text>
              </View>
            ) : (
              <View style={s.grid}>
                {filtered.map((company, idx) => (
                  <React.Fragment key={company._id || idx}>
                    <View style={s.gridCell}>
                      <CompanyCard
                        company={company}
                        onPress={() => navigation.navigate('CompanyDetails', { companyId: company._id, company })}
                      />
                    </View>
                    {idx === 5 && (
                      <View style={s.gridFull}>
                        <AdvertisementWidget position="inline" page="companies" containerStyle={{ marginVertical: 6 }} />
                      </View>
                    )}
                  </React.Fragment>
                ))}
              </View>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <View style={s.pagination}>
                <TouchableOpacity
                  style={[s.pageBtn, page === 1 && s.pageBtnDisabled]}
                  onPress={() => { if (page > 1) fetchCompanies(page - 1, search, true); }}
                  disabled={page === 1}
                >
                  <Ionicons name="chevron-back" size={15} color={page === 1 ? '#CBD5E0' : '#4361EE'} />
                  <Text style={[s.pageBtnTxt, page === 1 && { color: '#CBD5E0' }]}>Prev</Text>
                </TouchableOpacity>

                <View style={s.pageInfo}>
                  <Text style={s.pageInfoTxt}>Page {page} of {totalPages}</Text>
                </View>

                <TouchableOpacity
                  style={[s.pageBtn, page === totalPages && s.pageBtnDisabled]}
                  onPress={() => { if (page < totalPages) fetchCompanies(page + 1, search, true); }}
                  disabled={page === totalPages}
                >
                  <Text style={[s.pageBtnTxt, page === totalPages && { color: '#CBD5E0' }]}>Next</Text>
                  <Ionicons name="chevron-forward" size={15} color={page === totalPages ? '#CBD5E0' : '#4361EE'} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Mobile filter modal */}
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.sheetHead}>
              <Text style={s.sheetTitle}>All Filters</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={22} color="#1E293B" />
              </TouchableOpacity>
            </View>
            <SidebarFilters filters={filters} industries={industries} onChange={setFilter} onClear={clearFilters} />
            <TouchableOpacity style={s.applyBtn} onPress={() => setShowModal(false)}>
              <Text style={s.applyTxt}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#F1F5F9' },
  scroll: { flex: 1 },

  // Hero
  hero:       { backgroundColor: '#fff', paddingHorizontal: 24, paddingTop: 32, paddingBottom: 36, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  heroEye:    { fontSize: 11, fontWeight: '700', color: '#4361EE', letterSpacing: 1.5, marginBottom: 6 },
  heroTitle:  { fontSize: isWeb ? 30 : 22, fontWeight: '800', color: '#0F172A', marginBottom: 4, letterSpacing: -0.5 },
  heroSub:    { fontSize: 14, color: '#64748B', marginBottom: 20 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchBar:  { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1.5, borderColor: '#E2E8F0', paddingHorizontal: 14, paddingVertical: 11 },
  searchIn:   { flex: 1, fontSize: 14, color: '#1E293B', outlineStyle: 'none' },
  searchBtn:  { backgroundColor: '#4361EE', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  searchBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // Category strip
  catSection: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  catScroll:  { paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
  catCard:    { paddingHorizontal: 18, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#fff', minWidth: 130, ...shadows.xs },
  catLabel:   { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 3 },
  catSub:     { fontSize: 12, color: '#64748B', fontWeight: '500' },

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

  // Grid
  grid:     { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
  gridCell: { width: '50%', paddingHorizontal: 5, marginBottom: 10 },
  gridFull: { width: '100%' },

  // States
  loader: { paddingVertical: 80, alignItems: 'center' },
  empty:  { alignItems: 'center', paddingVertical: 80 },
  emptyTxt: { fontSize: 16, fontWeight: '600', color: '#475569', marginTop: 14 },
  emptySub: { fontSize: 13, color: '#94A3B8', marginTop: 4 },

  // Pagination
  pagination:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 20, marginBottom: 10 },
  pageBtn:      { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 9, borderWidth: 1.5, borderColor: '#4361EE', backgroundColor: '#fff' },
  pageBtnDisabled: { borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
  pageBtnTxt:   { fontSize: 14, fontWeight: '600', color: '#4361EE' },
  pageInfo:     { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#4361EE', borderRadius: 9 },
  pageInfoTxt:  { fontSize: 13, fontWeight: '700', color: '#fff' },

  // Modal
  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet:     { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '88%' },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: '#1E293B' },
  applyBtn:  { margin: 16, backgroundColor: '#4361EE', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  applyTxt:  { color: '#fff', fontSize: 15, fontWeight: '700' },
});

// Sidebar styles
const sf = StyleSheet.create({
  wrap:     { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden', ...shadows.xs },
  topRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  title:    { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  clear:    { fontSize: 13, color: '#4361EE', fontWeight: '600' },
  group:    { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  groupHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  groupTitle: { fontSize: 13, fontWeight: '700', color: '#374151' },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 7, paddingHorizontal: 8, paddingVertical: 6, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  searchIn:  { flex: 1, fontSize: 12, color: '#1E293B', marginLeft: 5, outlineStyle: 'none' },
  row:       { flexDirection: 'row', alignItems: 'center', marginBottom: 9 },
  cb:        { width: 16, height: 16, borderRadius: 4, borderWidth: 1.5, borderColor: '#CBD5E0', alignItems: 'center', justifyContent: 'center', marginRight: 9 },
  cbOn:      { backgroundColor: '#4361EE', borderColor: '#4361EE' },
  rowLabel:  { fontSize: 13, color: '#374151', flex: 1 },
  count:     { fontSize: 12, color: '#94A3B8' },
  more:      { fontSize: 12, color: '#4361EE', fontWeight: '600', marginTop: 2 },
  pills:     { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 4 },
  pill:      { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
  pillOn:    { backgroundColor: '#EEF2FF', borderColor: '#4361EE' },
  pillTxt:   { fontSize: 12, color: '#475569', fontWeight: '500' },
  pillTxtOn: { color: '#4361EE', fontWeight: '700' },
});

// Card styles
const cc = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    flex: 1,
    ...shadows.sm,
  },
  logo:    { width: 52, height: 52, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoTxt: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  body:    { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  name:    { fontSize: 14, fontWeight: '700', color: '#0F172A', flex: 1, lineHeight: 20 },
  ratingRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16A34A', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5, marginRight: 7 },
  ratingNum:   { fontSize: 12, fontWeight: '700', color: '#fff' },
  reviewTxt:   { fontSize: 12, color: '#64748B' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 3, marginBottom: 8 },
  tag:    { fontSize: 12, color: '#475569' },
  sep:    { fontSize: 12, color: '#CBD5E0', marginHorizontal: 2 },
  jobsBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  jobsTxt:   { fontSize: 12, color: '#4361EE', fontWeight: '600' },
});
