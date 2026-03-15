import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, Platform, RefreshControl, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../config/api';

// ─── FAQ Accordion Item ───────────────────────────────────────────────────────
const FAQItem = ({ faq, isOpen, onToggle }) => {
  const [anim] = useState(new Animated.Value(isOpen ? 1 : 0));

  useEffect(() => {
    Animated.timing(anim, { toValue: isOpen ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }, [isOpen]);

  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <View style={styles.faqItem}>
      <TouchableOpacity style={styles.faqQuestion} onPress={onToggle} activeOpacity={0.7}>
        <View style={styles.faqQuestionLeft}>
          {faq.isFeatured && <View style={styles.featuredDot} />}
          <Text style={styles.faqQuestionText}>{faq.question}</Text>
        </View>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Ionicons name="chevron-down" size={18} color="#64748B" />
        </Animated.View>
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{faq.answer}</Text>
        </View>
      )}
    </View>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function FAQScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState(null);

  const fetchFAQs = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await fetch(`${API_URL}/faqs`);
      const data = await res.json();
      if (data.success) {
        setFaqs(data.data);
        setGrouped(data.grouped || {});
        setCategories(Object.keys(data.grouped || {}));
      }
    } catch (e) {
      console.error('FAQ fetch error:', e);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchFAQs(); }, [fetchFAQs]);

  // Filter logic
  const getFiltered = () => {
    let list = activeCategory === 'all' ? faqs : (grouped[activeCategory] || []);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(f => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
    }
    return list;
  };

  const filteredFaqs = getFiltered();

  // Group filtered by category
  const filteredGrouped = filteredFaqs.reduce((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {});

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text style={styles.loadingText}>Loading FAQs...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Hero */}
      <View style={styles.hero}>
        {navigation?.canGoBack?.() && (
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
        )}
        <View style={styles.heroIcon}>
          <Ionicons name="help-circle" size={32} color="#3B82F6" />
        </View>
        <Text style={styles.heroTitle}>Frequently Asked Questions</Text>
        <Text style={styles.heroSubtitle}>Find answers to common questions about our platform</Text>

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search questions..."
            value={search}
            onChangeText={v => { setSearch(v); setOpenId(null); }}
            placeholderTextColor="#94A3B8"
          />
          {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color="#94A3B8" /></TouchableOpacity> : null}
        </View>
      </View>

      {/* Category Tabs */}
      {categories.length > 1 && (
        <View style={styles.tabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
            <TouchableOpacity style={[styles.tab, activeCategory === 'all' && styles.tabActive]} onPress={() => { setActiveCategory('all'); setOpenId(null); }}>
              <Text style={[styles.tabText, activeCategory === 'all' && styles.tabTextActive]}>All</Text>
            </TouchableOpacity>
            {categories.map(cat => (
              <TouchableOpacity key={cat} style={[styles.tab, activeCategory === cat && styles.tabActive]} onPress={() => { setActiveCategory(cat); setOpenId(null); }}>
                <Text style={[styles.tabText, activeCategory === cat && styles.tabTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* FAQ List */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchFAQs(true)} colors={['#3B82F6']} />}
      >
        {filteredFaqs.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="search-outline" size={48} color="#E2E8F0" />
            <Text style={styles.emptyText}>No results found</Text>
            <Text style={styles.emptySubtext}>Try a different search term or category</Text>
          </View>
        ) : (
          Object.entries(filteredGrouped).map(([cat, items]) => (
            <View key={cat} style={styles.categorySection}>
              {Object.keys(filteredGrouped).length > 1 && (
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryDot} />
                  <Text style={styles.categoryLabel}>{cat}</Text>
                </View>
              )}
              <View style={styles.faqGroup}>
                {items.map(faq => (
                  <FAQItem
                    key={faq._id}
                    faq={faq}
                    isOpen={openId === faq._id}
                    onToggle={() => setOpenId(openId === faq._id ? null : faq._id)}
                  />
                ))}
              </View>
            </View>
          ))
        )}

        {/* Contact CTA */}
        <View style={styles.ctaBox}>
          <Ionicons name="chatbubble-ellipses-outline" size={28} color="#3B82F6" />
          <Text style={styles.ctaTitle}>Still have questions?</Text>
          <Text style={styles.ctaText}>Can't find what you're looking for? Our support team is here to help.</Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => navigation?.navigate?.('LiveChatSupport')}>
            <Text style={styles.ctaBtnText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  loadingText: { marginTop: 12, fontSize: 15, color: '#94A3B8' },
  // Hero
  hero: { backgroundColor: '#fff', paddingTop: Platform.OS === 'ios' ? 56 : 40, paddingBottom: 20, paddingHorizontal: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 56 : 16, left: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  heroIcon: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  heroTitle: { fontSize: 22, fontWeight: '700', color: '#0F172A', textAlign: 'center', marginBottom: 6 },
  heroSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 16, lineHeight: 20 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 2, borderWidth: 1, borderColor: '#E2E8F0', width: '100%', maxWidth: 480 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: '#0F172A' },
  // Tabs
  tabsWrapper: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tabs: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  tab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  tabActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  tabText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  tabTextActive: { color: '#fff', fontWeight: '600' },
  // List
  list: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 40, maxWidth: 720, alignSelf: 'center', width: '100%' },
  categorySection: { marginBottom: 8 },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, marginTop: 8 },
  categoryDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3B82F6' },
  categoryLabel: { fontSize: 12, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.6 },
  faqGroup: { borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#fff' },
  faqItem: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  faqQuestion: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, gap: 12 },
  faqQuestionLeft: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  featuredDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#F59E0B', marginTop: 6, flexShrink: 0 },
  faqQuestionText: { flex: 1, fontSize: 15, fontWeight: '600', color: '#0F172A', lineHeight: 22 },
  faqAnswer: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 0 },
  faqAnswerText: { fontSize: 14, color: '#475569', lineHeight: 22 },
  // Empty
  emptyBox: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#94A3B8', marginTop: 12 },
  emptySubtext: { fontSize: 13, color: '#CBD5E1', marginTop: 4 },
  // CTA
  ctaBox: { marginTop: 24, backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  ctaTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A', marginTop: 10, marginBottom: 6 },
  ctaText: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 19, marginBottom: 16 },
  ctaBtn: { backgroundColor: '#3B82F6', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  ctaBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
