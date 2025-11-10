import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const StatCard = ({ icon, iconColor, iconBg, count, label }) => {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const width = dimensions?.width || Dimensions.get('window').width;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
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

const getStyles = (isMobile, isTablet) => StyleSheet.create({
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
    flex: isMobile ? 1 : 1,
    marginHorizontal: isMobile ? 4 : 8,
    minWidth: isMobile ? 'calc(50% - 8px)' : undefined,
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
    minWidth: 0,
  },
  count: {
    fontSize: isMobile ? 24 : isTablet ? 28 : 32,
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

