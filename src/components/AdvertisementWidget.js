import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Linking } from 'react-native';
import { API_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AdSenseComponent from './AdSenseComponent';
import AdMobComponent from './AdMobComponent';

/**
 * Advertisement Widget Component - Fully Dynamic with AdMob & AdSense
 * Displays advertisements based on position, page, user type, and device
 * Supports: custom ads, Google AdSense, and Google AdMob
 */
const AdvertisementWidget = ({
  position = 'header',
  page = 'all',
  containerStyle = {},
  onAdClick = null,
  maxAds = 1,
}) => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState('all');
  const [device, setDevice] = useState('desktop');

  useEffect(() => {
    detectUserType();
    detectDevice();
    fetchAdvertisements();
  }, [position, page]);

  const detectUserType = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUserType(user.userType || 'all');
      } else {
        setUserType('all');
      }
    } catch (error) {
      console.error('Error detecting user type:', error);
      setUserType('all');
    }
  };

  const detectDevice = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const width = window.innerWidth || 1024;
      if (width < 768) {
        setDevice('mobile');
      } else if (width < 1024) {
        setDevice('tablet');
      } else {
        setDevice('desktop');
      }
    } else if (Platform.OS === 'ios' || Platform.OS === 'android') {
      setDevice('mobile');
    }
  };

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/advertisements?position=${position}&page=${page}&userType=${userType}&device=${device}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      if (data.success && data.data) {
        const limitedAds = data.data.slice(0, maxAds);
        setAds(limitedAds);
        
        // Record impressions
        limitedAds.forEach(ad => {
          recordImpression(ad._id);
        });
      }
    } catch (error) {
      console.error('Error fetching advertisements:', error);
    } finally {
      setLoading(false);
    }
  };

  const recordImpression = async (adId) => {
    try {
      await fetch(`${API_URL}/advertisements/${adId}/impression`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error recording impression:', error);
    }
  };

  const recordClick = async (adId) => {
    try {
      await fetch(`${API_URL}/advertisements/${adId}/click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error recording click:', error);
    }
  };

  const handleAdClick = useCallback(async (ad) => {
    await recordClick(ad._id);

    if (onAdClick) {
      onAdClick(ad);
    }

    if (ad.content?.linkUrl) {
      try {
        const url = ad.content.linkUrl.startsWith('http') 
          ? ad.content.linkUrl 
          : `https://${ad.content.linkUrl}`;
        
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.open(url, '_blank');
        } else {
          await Linking.openURL(url);
        }
      } catch (error) {
        console.error('Error opening link:', error);
      }
    }
  }, [onAdClick]);

  const renderCustomAd = (ad) => {
    const displaySettings = ad.displaySettings || {};
    const content = ad.content || {};

    const adStyle = {
      width: displaySettings.width || 'auto',
      height: displaySettings.height || 'auto',
      backgroundColor: displaySettings.backgroundColor || '#ffffff',
      borderColor: displaySettings.borderColor || '#cccccc',
      borderRadius: displaySettings.borderRadius || 0,
      borderWidth: 1,
      marginTop: displaySettings.margin?.top || 10,
      marginRight: displaySettings.margin?.right || 10,
      marginBottom: displaySettings.margin?.bottom || 10,
      marginLeft: displaySettings.margin?.left || 10,
      paddingTop: displaySettings.padding?.top || 10,
      paddingRight: displaySettings.padding?.right || 10,
      paddingBottom: displaySettings.padding?.bottom || 10,
      paddingLeft: displaySettings.padding?.left || 10,
      overflow: 'hidden',
    };

    return (
      <TouchableOpacity
        key={ad._id}
        style={[styles.adContainer, adStyle]}
        onPress={() => handleAdClick(ad)}
        activeOpacity={0.8}
      >
        {content.html && Platform.OS === 'web' && typeof document !== 'undefined' && (
          React.createElement('div', { dangerouslySetInnerHTML: { __html: content.html } })
        )}

        {content.imageUrl && (
          <Image
            source={{ uri: content.imageUrl }}
            style={styles.adImage}
            resizeMode="contain"
            alt={content.imageAlt || ad.title}
          />
        )}

        {content.text && (
          <Text style={styles.adText}>{content.text}</Text>
        )}

        {content.linkText && (
          <View style={styles.adLinkButton}>
            <Text style={styles.adLinkText}>{content.linkText}</Text>
          </View>
        )}

        <View style={styles.adLabel}>
          <Text style={styles.adLabelText}>Ad</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderAdSenseAd = (ad) => {
    const adsense = ad.adsense || {};
    const displaySettings = ad.displaySettings || {};

    if (Platform.OS !== 'web') {
      return null; // AdSense only on web
    }

    if (!adsense.adClient || !adsense.adSlot) {
      return null; // Missing required AdSense config
    }

    const adStyle = {
      width: displaySettings.width || 728,
      height: displaySettings.height || 90,
      marginTop: displaySettings.margin?.top || 10,
      marginRight: displaySettings.margin?.right || 10,
      marginBottom: displaySettings.margin?.bottom || 10,
      marginLeft: displaySettings.margin?.left || 10,
    };

    return (
      <View key={ad._id} style={[styles.adContainer, adStyle]}>
        <AdSenseComponent
          adClient={adsense.adClient}
          adSlot={adsense.adSlot}
          adFormat={adsense.adFormat || 'auto'}
          fullWidthResponsive={true}
          style={adStyle}
        />
        <View style={styles.adLabel}>
          <Text style={styles.adLabelText}>Ad</Text>
        </View>
      </View>
    );
  };

  const renderAdMobAd = (ad) => {
    const admob = ad.admob || {};
    const displaySettings = ad.displaySettings || {};

    if (Platform.OS === 'web') {
      return null; // AdMob only on mobile
    }

    if (!admob.adUnitId) {
      return null; // Missing required AdMob config
    }

    const adStyle = {
      marginTop: displaySettings.margin?.top || 10,
      marginRight: displaySettings.margin?.right || 10,
      marginBottom: displaySettings.margin?.bottom || 10,
      marginLeft: displaySettings.margin?.left || 10,
    };

    return (
      <View key={ad._id} style={[styles.adContainer, adStyle]}>
        <AdMobComponent
          adUnitId={admob.adUnitId}
          adSize={admob.adSize || 'banner'}
          testMode={__DEV__}
          onAdLoaded={() => console.log('AdMob ad loaded')}
          onAdFailedToLoad={(error) => console.error('AdMob ad failed:', error)}
          style={adStyle}
        />
      </View>
    );
  };

  const renderAd = (ad) => {
    switch (ad.type) {
      case 'adsense':
        return renderAdSenseAd(ad);
      case 'admob':
        return renderAdMobAd(ad);
      default:
        return renderCustomAd(ad);
    }
  };

  if (loading || ads.length === 0) {
    return null;
  }

  return (
    <View style={[styles.widgetContainer, containerStyle]}>
      {ads.map(ad => renderAd(ad))}
    </View>
  );
};

const styles = StyleSheet.create({
  widgetContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  adContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adImage: {
    width: '100%',
    height: '100%',
  },
  adText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    paddingVertical: 8,
  },
  adLinkButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  adLinkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  adLabel: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adLabelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
});

export default AdvertisementWidget;
