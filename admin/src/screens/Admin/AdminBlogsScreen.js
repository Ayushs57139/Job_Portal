import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AdminLayout from '../../components/Admin/AdminLayout';
import api from '../../config/api';
import { colors, spacing, typography, borderRadius, shadows } from '../../styles/theme';
import { useResponsive } from '../../utils/responsive';

const AdminBlogsScreen = ({ navigation }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const dynamicStyles = getStyles(isMobile, isTablet);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    // Comment stats
    allComments: 0,
    mineComments: 0,
    approvedComments: 0,
    unapprovedComments: 0,
    spamComments: 0,
    trashComments: 0,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Comment filters
  const [commentFilter, setCommentFilter] = useState('ALL');
  const [commentDateFilter, setCommentDateFilter] = useState('ALL_TIME');
  const [customCommentDateModalVisible, setCustomCommentDateModalVisible] = useState(false);
  const [customCommentDateRange, setCustomCommentDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);

  const handleLogout = () => navigation.replace('AdminLogin');
  const handleNavigate = (screen) => navigation.navigate(screen);

  useEffect(() => {
    loadData();
  }, [searchQuery, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      await api.init();

      const response = await api.get('/blogs/admin/all');
      
      if (response && response.blogs) {
        let filteredBlogs = response.blogs;

        // Apply search filter
        if (searchQuery.trim()) {
          filteredBlogs = filteredBlogs.filter(blog =>
            blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            blog.author?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        // Apply status filter
        if (statusFilter) {
          filteredBlogs = filteredBlogs.filter(blog => {
            if (statusFilter === 'published') return blog.published === true;
            if (statusFilter === 'draft') return blog.published === false;
            return true;
          });
        }

        setBlogs(filteredBlogs);
        calculateStats(response.blogs);
        calculateCommentStats(response.blogs);
      }
    } catch (error) {
      console.error('Error loading blogs:', error);
      Alert.alert('Error', 'Failed to load blogs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = (blogsData) => {
    const total = blogsData.length;
    const published = blogsData.filter(b => b.published === true).length;
    const draft = blogsData.filter(b => b.published === false).length;

    setStats(prevStats => ({
      ...prevStats,
      total,
      published,
      draft,
    }));
  };

  const calculateCommentStats = (blogsData) => {
    let allComments = 0;
    let mineComments = 0;
    let approvedComments = 0;
    let unapprovedComments = 0;
    let spamComments = 0;
    let trashComments = 0;

    blogsData.forEach(blog => {
      if (blog.comments && Array.isArray(blog.comments)) {
        blog.comments.forEach(comment => {
          allComments++;

          if (comment.isAdmin || comment.user?.role === 'admin' || comment.user?.role === 'ADMIN') {
            mineComments++;
          }

          if (comment.status === 'approved' || comment.isApproved) {
            approvedComments++;
          }

          if (comment.status === 'pending' || comment.status === 'unapproved' || (!comment.isApproved && comment.status !== 'approved')) {
            unapprovedComments++;
          }

          if (comment.status === 'spam' || comment.isSpam) {
            spamComments++;
          }

          if (comment.status === 'trash' || comment.isDeleted || comment.deleted) {
            trashComments++;
          }
        });
      }
    });

    setStats(prevStats => ({
      ...prevStats,
      allComments,
      mineComments,
      approvedComments,
      unapprovedComments,
      spamComments,
      trashComments,
    }));
  };

  const getFilteredComments = (comments) => {
    if (!comments || !Array.isArray(comments)) return [];

    // First filter by status
    let filtered = comments;
    switch (commentFilter) {
      case 'MINE':
        filtered = comments.filter(c => c.isAdmin || c.user?.role === 'admin' || c.user?.role === 'ADMIN');
        break;
      case 'APPROVED':
        filtered = comments.filter(c => c.status === 'approved' || c.isApproved);
        break;
      case 'UNAPPROVED':
        filtered = comments.filter(c => c.status === 'pending' || c.status === 'unapproved' || (!c.isApproved && c.status !== 'approved'));
        break;
      case 'SPAM':
        filtered = comments.filter(c => c.status === 'spam' || c.isSpam);
        break;
      case 'TRASH':
        filtered = comments.filter(c => c.status === 'trash' || c.isDeleted || c.deleted);
        break;
      case 'ALL':
      default:
        filtered = comments;
    }

    // Then filter by date
    return filterCommentsByDate(filtered);
  };

  const filterCommentsByDate = (comments) => {
    if (commentDateFilter === 'ALL_TIME') {
      return comments;
    }

    const now = new Date();
    let startDate;

    switch (commentDateFilter) {
      case 'LAST_24_HOURS':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'LAST_7_DAYS':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'LAST_14_DAYS':
        startDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case 'LAST_30_DAYS':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'LAST_90_DAYS':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'LAST_120_DAYS':
        startDate = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000);
        break;
      case 'LAST_6_MONTHS':
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case 'LAST_9_MONTHS':
        startDate = new Date(now.getTime() - 270 * 24 * 60 * 60 * 1000);
        break;
      case 'LAST_12_MONTHS':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'CUSTOM':
        if (customCommentDateRange.startDate && customCommentDateRange.endDate) {
          const customStart = new Date(customCommentDateRange.startDate);
          const customEnd = new Date(customCommentDateRange.endDate);
          customEnd.setHours(23, 59, 59, 999);
          return comments.filter(comment => {
            const commentDate = new Date(comment.createdAt);
            return commentDate >= customStart && commentDate <= customEnd;
          });
        }
        return comments;
      default:
        return comments;
    }

    return comments.filter(comment => {
      const commentDate = new Date(comment.createdAt);
      return commentDate >= startDate;
    });
  };

  const handleCustomCommentDateApply = () => {
    if (!customCommentDateRange.startDate || !customCommentDateRange.endDate) {
      Alert.alert('Validation Error', 'Please select both start and end dates');
      return;
    }

    const start = new Date(customCommentDateRange.startDate);
    const end = new Date(customCommentDateRange.endDate);

    if (start > end) {
      Alert.alert('Validation Error', 'Start date must be before end date');
      return;
    }

    setCommentDateFilter('CUSTOM');
    setCustomCommentDateModalVisible(false);
  };

  const getCommentDateFilterLabel = () => {
    switch (commentDateFilter) {
      case 'LAST_24_HOURS': return 'Last 24 Hours';
      case 'LAST_7_DAYS': return 'Last 7 Days';
      case 'LAST_14_DAYS': return 'Last 14 Days';
      case 'LAST_30_DAYS': return 'Last 30 Days';
      case 'LAST_90_DAYS': return 'Last 90 Days';
      case 'LAST_120_DAYS': return 'Last 120 Days';
      case 'LAST_6_MONTHS': return 'Last 6 Months';
      case 'LAST_9_MONTHS': return 'Last 9 Months';
      case 'LAST_12_MONTHS': return 'Last 12 Months';
      case 'CUSTOM': return 'Custom Date';
      case 'ALL_TIME':
      default: return 'All Time';
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleViewDetails = (blog) => {
    setSelectedBlog(blog);
    setDetailModalVisible(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderStatCard = (title, value, icon, color) => (
    <View style={[dynamicStyles.statCard, { borderLeftColor: color }]}>
      <View style={[dynamicStyles.statIconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={dynamicStyles.statContent}>
        <Text style={dynamicStyles.statValue}>{value}</Text>
        <Text style={dynamicStyles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const renderBlogCard = (blog) => (
    <TouchableOpacity
      key={blog._id}
      style={dynamicStyles.blogCard}
      onPress={() => handleViewDetails(blog)}
      activeOpacity={0.7}
    >
      <View style={dynamicStyles.blogHeader}>
        <Text style={dynamicStyles.blogTitle} numberOfLines={2}>
          {blog.title}
        </Text>
        <View style={[dynamicStyles.statusBadge, blog.published ? dynamicStyles.publishedBadge : dynamicStyles.draftBadge]}>
          <Text style={dynamicStyles.statusBadgeText}>
            {blog.published ? 'Published' : 'Draft'}
          </Text>
        </View>
      </View>

      <Text style={dynamicStyles.blogExcerpt} numberOfLines={2}>
        {blog.excerpt}
      </Text>

      <View style={dynamicStyles.blogMeta}>
        <View style={dynamicStyles.metaItem}>
          <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
          <Text style={dynamicStyles.metaText}>{blog.author || 'Anonymous'}</Text>
        </View>
        <View style={dynamicStyles.metaItem}>
          <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
          <Text style={dynamicStyles.metaText}>{blog.readTime || '5 min read'}</Text>
        </View>
        <View style={dynamicStyles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
          <Text style={dynamicStyles.metaText}>{formatDate(blog.createdAt)}</Text>
        </View>
      </View>

      {blog.category && (
        <View style={dynamicStyles.categoryBadge}>
          <Text style={dynamicStyles.categoryText}>{blog.category}</Text>
        </View>
      )}

      <View style={dynamicStyles.commentCount}>
        <Ionicons name="chatbubble-outline" size={16} color={colors.primary} />
        <Text style={dynamicStyles.commentCountText}>
          {blog.comments?.length || 0} comments
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <AdminLayout
        title="Blogs"
        activeScreen="AdminBlogs"
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={dynamicStyles.loadingText}>Loading blogs...</Text>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Blogs"
      activeScreen="AdminBlogs"
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      <ScrollView
        style={dynamicStyles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={dynamicStyles.header}>
          <View>
            <Text style={dynamicStyles.pageTitle}>Blogs</Text>
            <Text style={dynamicStyles.pageSubtitle}>Manage blog posts</Text>
          </View>
        </View>

        {/* Statistics */}
        <View style={dynamicStyles.statsContainer}>
          <View style={dynamicStyles.statsRow}>
            {renderStatCard('Total Blogs', stats.total || 0, 'newspaper-outline', colors.primary)}
            {renderStatCard('Published', stats.published || 0, 'checkmark-circle-outline', colors.success)}
          </View>
          <View style={dynamicStyles.statsRow}>
            {renderStatCard('Draft', stats.draft || 0, 'document-outline', '#F59E0B')}
            {renderStatCard('Total Comments', stats.allComments || 0, 'chatbubble-outline', '#6366F1')}
          </View>
        </View>

        {/* Comment Statistics */}
        <View style={dynamicStyles.statsContainer}>
          <View style={dynamicStyles.sectionHeaderRow}>
            <Text style={dynamicStyles.sectionTitle}>Comment Statistics</Text>
            <View style={dynamicStyles.dateFilterContainer}>
              <Ionicons name="calendar-outline" size={16} color="#64748B" />
              <Text style={dynamicStyles.dateFilterLabel}>{getCommentDateFilterLabel()}</Text>
            </View>
          </View>

          {/* Date Filter Options */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={dynamicStyles.dateFilterScroll}
            contentContainerStyle={dynamicStyles.dateFilterContent}
          >
            <TouchableOpacity 
              style={[dynamicStyles.dateFilterChip, commentDateFilter === 'ALL_TIME' && dynamicStyles.dateFilterChipActive]}
              onPress={() => setCommentDateFilter('ALL_TIME')}
            >
              <Text style={[dynamicStyles.dateFilterChipText, commentDateFilter === 'ALL_TIME' && dynamicStyles.dateFilterChipTextActive]}>
                All Time
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.dateFilterChip, commentDateFilter === 'LAST_24_HOURS' && dynamicStyles.dateFilterChipActive]}
              onPress={() => setCommentDateFilter('LAST_24_HOURS')}
            >
              <Text style={[dynamicStyles.dateFilterChipText, commentDateFilter === 'LAST_24_HOURS' && dynamicStyles.dateFilterChipTextActive]}>
                Last 24 Hours
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.dateFilterChip, commentDateFilter === 'LAST_7_DAYS' && dynamicStyles.dateFilterChipActive]}
              onPress={() => setCommentDateFilter('LAST_7_DAYS')}
            >
              <Text style={[dynamicStyles.dateFilterChipText, commentDateFilter === 'LAST_7_DAYS' && dynamicStyles.dateFilterChipTextActive]}>
                Last 7 Days
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.dateFilterChip, commentDateFilter === 'LAST_14_DAYS' && dynamicStyles.dateFilterChipActive]}
              onPress={() => setCommentDateFilter('LAST_14_DAYS')}
            >
              <Text style={[dynamicStyles.dateFilterChipText, commentDateFilter === 'LAST_14_DAYS' && dynamicStyles.dateFilterChipTextActive]}>
                Last 14 Days
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.dateFilterChip, commentDateFilter === 'LAST_30_DAYS' && dynamicStyles.dateFilterChipActive]}
              onPress={() => setCommentDateFilter('LAST_30_DAYS')}
            >
              <Text style={[dynamicStyles.dateFilterChipText, commentDateFilter === 'LAST_30_DAYS' && dynamicStyles.dateFilterChipTextActive]}>
                Last 30 Days
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.dateFilterChip, commentDateFilter === 'LAST_90_DAYS' && dynamicStyles.dateFilterChipActive]}
              onPress={() => setCommentDateFilter('LAST_90_DAYS')}
            >
              <Text style={[dynamicStyles.dateFilterChipText, commentDateFilter === 'LAST_90_DAYS' && dynamicStyles.dateFilterChipTextActive]}>
                Last 90 Days
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.dateFilterChip, commentDateFilter === 'LAST_120_DAYS' && dynamicStyles.dateFilterChipActive]}
              onPress={() => setCommentDateFilter('LAST_120_DAYS')}
            >
              <Text style={[dynamicStyles.dateFilterChipText, commentDateFilter === 'LAST_120_DAYS' && dynamicStyles.dateFilterChipTextActive]}>
                Last 120 Days
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.dateFilterChip, commentDateFilter === 'LAST_6_MONTHS' && dynamicStyles.dateFilterChipActive]}
              onPress={() => setCommentDateFilter('LAST_6_MONTHS')}
            >
              <Text style={[dynamicStyles.dateFilterChipText, commentDateFilter === 'LAST_6_MONTHS' && dynamicStyles.dateFilterChipTextActive]}>
                Last 6 Months
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.dateFilterChip, commentDateFilter === 'LAST_9_MONTHS' && dynamicStyles.dateFilterChipActive]}
              onPress={() => setCommentDateFilter('LAST_9_MONTHS')}
            >
              <Text style={[dynamicStyles.dateFilterChipText, commentDateFilter === 'LAST_9_MONTHS' && dynamicStyles.dateFilterChipTextActive]}>
                Last 9 Months
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.dateFilterChip, commentDateFilter === 'LAST_12_MONTHS' && dynamicStyles.dateFilterChipActive]}
              onPress={() => setCommentDateFilter('LAST_12_MONTHS')}
            >
              <Text style={[dynamicStyles.dateFilterChipText, commentDateFilter === 'LAST_12_MONTHS' && dynamicStyles.dateFilterChipTextActive]}>
                Last 12 Months
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.dateFilterChip, commentDateFilter === 'CUSTOM' && dynamicStyles.dateFilterChipActive]}
              onPress={() => setCustomCommentDateModalVisible(true)}
            >
              <Ionicons name="calendar" size={14} color={commentDateFilter === 'CUSTOM' ? '#FFF' : '#4A90E2'} />
              <Text style={[dynamicStyles.dateFilterChipText, commentDateFilter === 'CUSTOM' && dynamicStyles.dateFilterChipTextActive]}>
                Custom Date
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Comment Status Filters */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={dynamicStyles.commentStatsScroll}
            contentContainerStyle={dynamicStyles.commentStatsContent}
          >
            <TouchableOpacity 
              style={[dynamicStyles.commentStatCard, commentFilter === 'ALL' && dynamicStyles.commentStatCardActive]}
              onPress={() => setCommentFilter('ALL')}
            >
              <Ionicons name="chatbubbles-outline" size={24} color={commentFilter === 'ALL' ? '#FFF' : '#3498DB'} />
              <Text style={[dynamicStyles.commentStatValue, commentFilter === 'ALL' && dynamicStyles.commentStatValueActive]}>
                {stats.allComments}
              </Text>
              <Text style={[dynamicStyles.commentStatLabel, commentFilter === 'ALL' && dynamicStyles.commentStatLabelActive]}>
                All Comments
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.commentStatCard, commentFilter === 'MINE' && dynamicStyles.commentStatCardActive]}
              onPress={() => setCommentFilter('MINE')}
            >
              <Ionicons name="person-outline" size={24} color={commentFilter === 'MINE' ? '#FFF' : '#9B59B6'} />
              <Text style={[dynamicStyles.commentStatValue, commentFilter === 'MINE' && dynamicStyles.commentStatValueActive]}>
                {stats.mineComments}
              </Text>
              <Text style={[dynamicStyles.commentStatLabel, commentFilter === 'MINE' && dynamicStyles.commentStatLabelActive]}>
                Mine/Admin
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.commentStatCard, commentFilter === 'APPROVED' && dynamicStyles.commentStatCardActive]}
              onPress={() => setCommentFilter('APPROVED')}
            >
              <Ionicons name="checkmark-circle-outline" size={24} color={commentFilter === 'APPROVED' ? '#FFF' : '#27AE60'} />
              <Text style={[dynamicStyles.commentStatValue, commentFilter === 'APPROVED' && dynamicStyles.commentStatValueActive]}>
                {stats.approvedComments}
              </Text>
              <Text style={[dynamicStyles.commentStatLabel, commentFilter === 'APPROVED' && dynamicStyles.commentStatLabelActive]}>
                Approved
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.commentStatCard, commentFilter === 'UNAPPROVED' && dynamicStyles.commentStatCardActive]}
              onPress={() => setCommentFilter('UNAPPROVED')}
            >
              <Ionicons name="time-outline" size={24} color={commentFilter === 'UNAPPROVED' ? '#FFF' : '#F39C12'} />
              <Text style={[dynamicStyles.commentStatValue, commentFilter === 'UNAPPROVED' && dynamicStyles.commentStatValueActive]}>
                {stats.unapprovedComments}
              </Text>
              <Text style={[dynamicStyles.commentStatLabel, commentFilter === 'UNAPPROVED' && dynamicStyles.commentStatLabelActive]}>
                Unapproved
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.commentStatCard, commentFilter === 'SPAM' && dynamicStyles.commentStatCardActive]}
              onPress={() => setCommentFilter('SPAM')}
            >
              <Ionicons name="warning-outline" size={24} color={commentFilter === 'SPAM' ? '#FFF' : '#E67E22'} />
              <Text style={[dynamicStyles.commentStatValue, commentFilter === 'SPAM' && dynamicStyles.commentStatValueActive]}>
                {stats.spamComments}
              </Text>
              <Text style={[dynamicStyles.commentStatLabel, commentFilter === 'SPAM' && dynamicStyles.commentStatLabelActive]}>
                Spam
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.commentStatCard, commentFilter === 'TRASH' && dynamicStyles.commentStatCardActive]}
              onPress={() => setCommentFilter('TRASH')}
            >
              <Ionicons name="trash-outline" size={24} color={commentFilter === 'TRASH' ? '#FFF' : '#E74C3C'} />
              <Text style={[dynamicStyles.commentStatValue, commentFilter === 'TRASH' && dynamicStyles.commentStatValueActive]}>
                {stats.trashComments}
              </Text>
              <Text style={[dynamicStyles.commentStatLabel, commentFilter === 'TRASH' && dynamicStyles.commentStatLabelActive]}>
                Trash
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Filters */}
        <View style={dynamicStyles.filtersContainer}>
          <Text style={dynamicStyles.filtersTitle}>Filters</Text>
          
          <View style={dynamicStyles.filterRow}>
            <TextInput
              style={dynamicStyles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search blogs..."
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={dynamicStyles.filterRow}>
            <View style={dynamicStyles.filterItem}>
              <Text style={dynamicStyles.filterLabel}>Status</Text>
              <View style={dynamicStyles.pickerWrapper}>
                <Picker
                  selectedValue={statusFilter}
                  onValueChange={setStatusFilter}
                  style={dynamicStyles.pickerInput}
                >
                  <Picker.Item label="All Status" value="" />
                  <Picker.Item label="Published" value="published" />
                  <Picker.Item label="Draft" value="draft" />
                </Picker>
              </View>
            </View>
          </View>
        </View>

        {/* Blogs List */}
        <View style={dynamicStyles.blogsContainer}>
          <Text style={dynamicStyles.blogsTitle}>
            Blogs ({blogs.length} total)
          </Text>
          {blogs.length === 0 ? (
            <View style={dynamicStyles.emptyState}>
              <Ionicons name="newspaper-outline" size={64} color={colors.border} />
              <Text style={dynamicStyles.emptyStateTitle}>No blogs found</Text>
              <Text style={dynamicStyles.emptyStateText}>
                No blogs match your current filters
              </Text>
            </View>
          ) : (
            blogs.map((blog) => renderBlogCard(blog))
          )}
        </View>
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={detailModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={dynamicStyles.modalOverlay}>
          <TouchableOpacity 
            style={dynamicStyles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setDetailModalVisible(false)}
          />
          <View style={dynamicStyles.modalContainer}>
            <View style={dynamicStyles.modalHeader}>
              <View style={dynamicStyles.modalHeaderContent}>
                <View style={dynamicStyles.modalIconContainer}>
                  <Ionicons name="document-text" size={28} color="#4A90E2" />
                </View>
                <View style={dynamicStyles.modalTitleContainer}>
                  <Text style={dynamicStyles.modalTitle}>Blog Details</Text>
                  <Text style={dynamicStyles.modalSubtitle}>View blog information and comments</Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={() => setDetailModalVisible(false)}
                style={dynamicStyles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {selectedBlog && (
              <ScrollView style={dynamicStyles.modalContent}>
                {/* Blog Info */}
                <View style={dynamicStyles.detailSection}>
                  <Text style={dynamicStyles.detailSectionTitle}>Blog Information</Text>
                  
                  <View style={dynamicStyles.detailRow}>
                    <Text style={dynamicStyles.detailLabel}>Title:</Text>
                    <Text style={dynamicStyles.detailValue}>{selectedBlog.title}</Text>
                  </View>

                  <View style={dynamicStyles.detailRow}>
                    <Text style={dynamicStyles.detailLabel}>Author:</Text>
                    <Text style={dynamicStyles.detailValue}>{selectedBlog.author || 'Anonymous'}</Text>
                  </View>

                  <View style={dynamicStyles.detailRow}>
                    <Text style={dynamicStyles.detailLabel}>Category:</Text>
                    <Text style={dynamicStyles.detailValue}>{selectedBlog.category || 'N/A'}</Text>
                  </View>

                  <View style={dynamicStyles.detailRow}>
                    <Text style={dynamicStyles.detailLabel}>Status:</Text>
                    <Text style={dynamicStyles.detailValue}>{selectedBlog.published ? 'Published' : 'Draft'}</Text>
                  </View>

                  <View style={dynamicStyles.detailRow}>
                    <Text style={dynamicStyles.detailLabel}>Created:</Text>
                    <Text style={dynamicStyles.detailValue}>{formatDate(selectedBlog.createdAt)}</Text>
                  </View>
                </View>

                {/* Excerpt */}
                <View style={dynamicStyles.detailSection}>
                  <Text style={dynamicStyles.detailSectionTitle}>Excerpt</Text>
                  <Text style={dynamicStyles.detailContentText}>{selectedBlog.excerpt}</Text>
                </View>

                {/* Content */}
                <View style={dynamicStyles.detailSection}>
                  <Text style={dynamicStyles.detailSectionTitle}>Content</Text>
                  <Text style={dynamicStyles.detailContentText}>{selectedBlog.content}</Text>
                </View>

                {/* Comments */}
                {selectedBlog.comments && selectedBlog.comments.length > 0 && (
                  <View style={dynamicStyles.detailSection}>
                    <Text style={dynamicStyles.detailSectionTitle}>
                      Comments ({getFilteredComments(selectedBlog.comments).length})
                      {commentFilter !== 'ALL' && ` - ${commentFilter}`}
                    </Text>
                    {getFilteredComments(selectedBlog.comments).map((comment, index) => (
                      <View key={index} style={dynamicStyles.commentCard}>
                        <View style={dynamicStyles.commentHeader}>
                          <View style={dynamicStyles.commentAuthorRow}>
                            <Text style={dynamicStyles.commentAuthor}>
                              {comment.user?.firstName} {comment.user?.lastName}
                            </Text>
                            {(comment.isAdmin || comment.user?.role === 'admin' || comment.user?.role === 'ADMIN') && (
                              <View style={dynamicStyles.adminBadge}>
                                <Text style={dynamicStyles.adminBadgeText}>Admin</Text>
                              </View>
                            )}
                            {comment.status && (
                              <View style={[
                                dynamicStyles.commentStatusBadge,
                                comment.status === 'approved' && dynamicStyles.approvedBadge,
                                comment.status === 'pending' && dynamicStyles.pendingBadge,
                                comment.status === 'spam' && dynamicStyles.spamBadge,
                                comment.status === 'trash' && dynamicStyles.trashBadge,
                              ]}>
                                <Text style={dynamicStyles.commentStatusText}>{comment.status}</Text>
                              </View>
                            )}
                          </View>
                          <Text style={dynamicStyles.commentDate}>
                            {formatDate(comment.createdAt)}
                          </Text>
                        </View>
                        <Text style={dynamicStyles.commentContent}>{comment.content}</Text>
                      </View>
                    ))}
                    {getFilteredComments(selectedBlog.comments).length === 0 && (
                      <Text style={dynamicStyles.noCommentsText}>
                        No {commentFilter.toLowerCase()} comments found
                      </Text>
                    )}
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Custom Comment Date Filter Modal */}
      <Modal
        visible={customCommentDateModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setCustomCommentDateModalVisible(false)}
      >
        <View style={dynamicStyles.modalOverlay}>
          <TouchableOpacity 
            style={dynamicStyles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setCustomCommentDateModalVisible(false)}
          />
          <View style={dynamicStyles.customDateModalContainer}>
            <View style={dynamicStyles.modalHeader}>
              <View style={dynamicStyles.modalHeaderContent}>
                <View style={dynamicStyles.modalIconContainer}>
                  <Ionicons name="calendar" size={28} color="#4A90E2" />
                </View>
                <View style={dynamicStyles.modalTitleContainer}>
                  <Text style={dynamicStyles.modalTitle}>Custom Date Range</Text>
                  <Text style={dynamicStyles.modalSubtitle}>Filter comments by date range</Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={() => setCustomCommentDateModalVisible(false)}
                style={dynamicStyles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={dynamicStyles.customDateModalContent}>
              <View style={dynamicStyles.inputGroup}>
                <View style={dynamicStyles.labelRow}>
                  <Ionicons name="calendar-outline" size={18} color="#4A90E2" />
                  <Text style={dynamicStyles.label}>Start Date</Text>
                </View>
                <TextInput
                  style={dynamicStyles.input}
                  value={customCommentDateRange.startDate}
                  onChangeText={(text) => setCustomCommentDateRange({ ...customCommentDateRange, startDate: text })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={dynamicStyles.inputGroup}>
                <View style={dynamicStyles.labelRow}>
                  <Ionicons name="calendar-outline" size={18} color="#4A90E2" />
                  <Text style={dynamicStyles.label}>End Date</Text>
                </View>
                <TextInput
                  style={dynamicStyles.input}
                  value={customCommentDateRange.endDate}
                  onChangeText={(text) => setCustomCommentDateRange({ ...customCommentDateRange, endDate: text })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <Text style={dynamicStyles.hint}>
                💡 Enter dates in YYYY-MM-DD format (e.g., 2024-01-15)
              </Text>
            </View>

            <View style={dynamicStyles.modalFooter}>
              <TouchableOpacity
                style={dynamicStyles.cancelButton}
                onPress={() => setCustomCommentDateModalVisible(false)}
              >
                <Ionicons name="close-outline" size={20} color="#64748B" />
                <Text style={dynamicStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={dynamicStyles.saveButton}
                onPress={handleCustomCommentDateApply}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                <Text style={dynamicStyles.saveButtonText}>Apply Filter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </AdminLayout>
  );
};

const getStyles = (isMobile, isTablet) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.textSecondary,
  },
  header: {
    padding: isMobile ? spacing.md : spacing.lg,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pageTitle: {
    fontSize: isMobile ? 22 : 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statsContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  statContent: {
    flex: 1,
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  statTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: isMobile ? 16 : 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dateFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  dateFilterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  dateFilterScroll: {
    marginBottom: spacing.md,
  },
  dateFilterContent: {
    paddingRight: spacing.md,
    gap: 8,
  },
  dateFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  dateFilterChipActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  dateFilterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  dateFilterChipTextActive: {
    color: '#FFFFFF',
  },
  commentStatsScroll: {
    marginTop: spacing.sm,
  },
  commentStatsContent: {
    paddingRight: spacing.md,
    gap: 12,
  },
  commentStatCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    ...shadows.sm,
  },
  commentStatCardActive: {
    borderColor: '#4A90E2',
    backgroundColor: '#4A90E2',
  },
  commentStatValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  commentStatValueActive: {
    color: '#FFF',
  },
  commentStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  commentStatLabelActive: {
    color: '#FFF',
  },
  filtersContainer: {
    backgroundColor: '#FFF',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  filterItem: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 14,
    color: colors.text,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: '#FFF',
  },
  pickerInput: {
    height: 48,
  },
  blogsContainer: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  blogsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  blogCard: {
    backgroundColor: '#FFF',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  blogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  blogTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  publishedBadge: {
    backgroundColor: '#10B981',
  },
  draftBadge: {
    backgroundColor: '#6B7280',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
  },
  blogExcerpt: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  blogMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0E7FF',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4F46E5',
  },
  commentCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  commentCountText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl * 2,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: isMobile ? '95%' : isTablet ? '85%' : '90%',
    maxWidth: 800,
    maxHeight: '92%',
    overflow: 'hidden',
    ...shadows.lg,
  },
  customDateModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: isMobile ? '95%' : isTablet ? '70%' : '50%',
    maxWidth: 500,
    overflow: 'hidden',
    ...shadows.lg,
  },
  customDateModalContent: {
    padding: spacing.xl,
    backgroundColor: '#FAFBFC',
  },
  modalHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  modalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#EBF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: isMobile ? 20 : 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: isMobile ? 12 : 14,
    color: '#64748B',
  },
  modalCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalContent: {
    padding: spacing.xl,
    backgroundColor: '#FAFBFC',
  },
  detailSection: {
    marginBottom: spacing.xl,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 100,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  detailContentText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  commentCard: {
    backgroundColor: '#F9FAFB',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  commentAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  adminBadge: {
    backgroundColor: '#9B59B6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFF',
  },
  commentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  approvedBadge: {
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
  },
  pendingBadge: {
    backgroundColor: 'rgba(243, 156, 18, 0.1)',
  },
  spamBadge: {
    backgroundColor: 'rgba(230, 126, 34, 0.1)',
  },
  trashBadge: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
  commentStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
  },
  commentDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  commentContent: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  noCommentsText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
    fontStyle: 'italic',
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  input: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: spacing.md + 2,
    fontSize: 15,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
    ...shadows.sm,
  },
  hint: {
    fontSize: 12,
    color: '#64748B',
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: spacing.lg + 4,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: spacing.md,
    backgroundColor: '#FFFFFF',
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md + 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: spacing.xs,
    ...shadows.sm,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md + 4,
    borderRadius: 12,
    backgroundColor: '#4A90E2',
    gap: spacing.xs,
    ...shadows.md,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AdminBlogsScreen;
