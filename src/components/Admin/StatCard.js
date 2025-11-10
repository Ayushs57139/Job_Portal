import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const isMobile = width <= 600;
const isTablet = width > 600 && width <= 1024;
const isDesktop = width > 1024;

const StatCard = ({ icon, iconColor, iconBg, count, label }) => {
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: isMobile ? 14 : isTablet ? 16 : 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: isMobile ? 12 : 15,
    flex: 1,
    marginHorizontal: isMobile ? 4 : 8,
    minWidth: isMobile ? '100%' : 0,
  },
  iconContainer: {
    width: isMobile ? 48 : isTablet ? 52 : 56,
    height: isMobile ? 48 : isTablet ? 52 : 56,
    borderRadius: isMobile ? 24 : isTablet ? 26 : 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isMobile ? 12 : 15,
  },
  textContainer: {
    flex: 1,
  },
  count: {
    fontSize: isMobile ? 26 : isTablet ? 29 : 32,
    fontWeight: 'bold',
    color: '#333',
  },
  label: {
    fontSize: isMobile ? 12 : isTablet ? 13 : 14,
    color: '#666',
    marginTop: 4,
  },
});

export default StatCard;

