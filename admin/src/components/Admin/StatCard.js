import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '../../utils/responsive';

// Define getStyles before the component to avoid hoisting issues
const getStyles = (isMobile, isTablet) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: isMobile ? 16 : isTablet ? 18 : 22,
    alignItems: 'center',
    elevation: 4,
    marginBottom: isMobile ? 12 : 15,
    flex: isMobile ? 1 : 1,
    marginHorizontal: isMobile ? 4 : 8,
    minWidth: isMobile ? 'calc(50% - 8px)' : undefined,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    ...(Platform.OS === 'web' ? {
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)',
      cursor: 'default',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1)',
      },
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
    }),
  },
  iconContainer: {
    width: isMobile ? 56 : isTablet ? 60 : 64,
    height: isMobile ? 56 : isTablet ? 60 : 64,
    borderRadius: isMobile ? 28 : isTablet ? 30 : 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isMobile ? 14 : 16,
    ...(Platform.OS === 'web' && {
      transition: 'transform 0.3s ease',
    }),
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  count: {
    fontSize: isMobile ? 28 : isTablet ? 32 : 36,
    fontWeight: '800',
    color: '#1A202C',
    letterSpacing: -0.5,
    ...(Platform.OS === 'web' && {
      fontFeatureSettings: '"tnum"',
    }),
  },
  label: {
    fontSize: isMobile ? 13 : isTablet ? 14 : 15,
    color: '#718096',
    marginTop: 6,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

const StatCard = ({ icon, iconColor, iconBg, count, label }) => {
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isTablet = responsive.isTablet;
  const styles = getStyles(isMobile, isTablet);

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={isMobile ? 24 : isTablet ? 26 : 28} color={iconColor} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.count}>{count}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
};

export default StatCard;

