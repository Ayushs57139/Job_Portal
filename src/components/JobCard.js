import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius } from '../styles/theme';
import api from '../config/api';
import { useResponsive } from '../utils/responsive';

const getPlatform = () => {
  try {
    const { Platform } = require('react-native');
    if (Platform && typeof Platform.OS !== 'undefined') return Platform;
  } catch (e) {}
  return { OS: 'android' };
};
const isWeb = getPlatform().OS === 'web';

const JobCard = ({ job }) => {
  const navigation = useNavigation();
  const { width } = useResponsive();
  const [isSaved, setIsSaved] = useState(false);

  const isMobile = width <= 480;
  const isTabletDevice = width > 480 && width <= 834;

  const formatSalary = (min, max) => {
    if (!min && !max) return null;
    if (min && max) return `${api.formatIndianCurrency(min)} - ${api.formatIndianCurrency(max)}`;
    if (min) return `From ${api.formatIndianCurrency(min)}`;
    return `Up to ${api.formatIndianCurrency(max)}`;
  };

  const formatLocation = (location) => {
    if (!location) return null;
    if (typeof location === 'string') return location;
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    return parts.length > 0 ? parts.slice(0, 2).join(', ') : null;
  };

  const formatExperience = (totalExp) => {
    if (!totalExp) return null;
    if (typeof totalExp === 'string') return totalExp;
    if (totalExp.min && totalExp.max) return `${totalExp.min} - ${totalExp.max}`;
    if (totalExp.min) return `${totalExp.min}+`;
    return null;
  };

  const companyName = job.company?.name || job.companyName || '';
  const jobTitle = job.title || job.jobTitle || 'Untitled Job';
  const salary = formatSalary(job.salary?.min || job.salaryMin, job.salary?.max || job.salaryMax);
  const location = formatLocation(job.location);
  const experience = job.totalExperience ? formatExperience(job.totalExperience) : null;
  const jobSkills = (job.keySkills || job.skills || []).slice(0, isMobile ? 3 : 4);

  const getInitials = (name) => {
    if (!name) return 'J';
    const w = name.trim().split(' ');
    return w.length >= 2 ? (w[0][0] + w[1][0]).toUpperCase() : name[0].toUpperCase();
  };

  const getAvatarColor = (name) => {
    const palette = ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    if (!name) return palette[0];
    return palette[name.charCodeAt(0) % palette.length];
  };

  const avatarColor = getAvatarColor(companyName);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('JobDetails', { jobId: job._id, id: job._id })}
      activeOpacity={0.95}
    >
      {/* Header row */}
      <View style={styles.header}>
        <View style={[styles.logo, { backgroundColor: avatarColor + '18', borderColor: avatarColor + '30' }]}>
          <Text style={[styles.logoText, { color: avatarColor }]}>{getInitials(companyName)}</Text>
        </View>
        <View style={styles.headerMeta}>
          {companyName ? <Text style={styles.company} numberOfLines={1}>{companyName}</Text> : null}
          <Text style={styles.postedDate}>{api.formatIndianDate(job.createdAt)}</Text>
        </View>
        <TouchableOpacity onPress={(e) => { e.stopPropagation(); setIsSaved(!isSaved); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={18} color={isSaved ? colors.primary : '#94A3B8'} />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={2}>{jobTitle}</Text>

      {/* Meta row */}
      <View style={styles.metaRow}>
        {experience ? (
          <View style={styles.metaItem}>
            <Ionicons name="briefcase-outline" size={13} color="#64748B" />
            <Text style={styles.metaText}>{experience}</Text>
          </View>
        ) : null}
        {salary ? (
          <View style={styles.metaItem}>
            <Ionicons name="cash-outline" size={13} color="#64748B" />
            <Text style={styles.metaText}>{salary}</Text>
          </View>
        ) : null}
        {location ? (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={13} color="#64748B" />
            <Text style={styles.metaText} numberOfLines={1}>{location}</Text>
          </View>
        ) : null}
      </View>

      {/* Skills */}
      {jobSkills.length > 0 ? (
        <View style={styles.skills}>
          {jobSkills.map((skill, i) => (
            <View key={i} style={styles.skill}>
              <Text style={styles.skillText} numberOfLines={1}>{skill}</Text>
            </View>
          ))}
          {(job.keySkills || job.skills || []).length > jobSkills.length ? (
            <View style={styles.skill}>
              <Text style={styles.skillText}>+{(job.keySkills || job.skills || []).length - jobSkills.length}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.applyBtn}
          onPress={(e) => { e.stopPropagation(); navigation.navigate('JobApplication', { jobId: job._id }); }}
          activeOpacity={0.85}
        >
          <Text style={styles.applyBtnText}>Apply Now</Text>
        </TouchableOpacity>
        {job.urgent ? <View style={styles.urgentBadge}><Text style={styles.urgentText}>Urgent</Text></View> : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
    height: 220,
    ...(isWeb && {
      cursor: 'pointer',
      boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
      transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  logoText: {
    fontSize: 15,
    fontWeight: '700',
  },
  headerMeta: {
    flex: 1,
    gap: 1,
  },
  company: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  postedDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 22,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  skills: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 6,
    marginBottom: 12,
    overflow: 'hidden',
    maxHeight: 28,
  },
  skill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  skillText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 'auto',
  },
  applyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  applyBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
  urgentBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  urgentText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DC2626',
  },
});

export default JobCard;
