import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { AdMobBanner, setTestDeviceIDAsync } from 'expo-ads-admob';

/**
 * Google AdMob Component - Fully Integrated
 * Renders Google AdMob ads on mobile platforms
 * 
 * Usage:
 * <AdMobComponent
 *   adUnitId="ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX"
 *   adSize="banner"
 *   testMode={false}
 * />
 */
const AdMobComponent = ({
  adUnitId,
  adSize = 'banner', // banner, largeBanner, mediumRectangle, fullBanner, leaderboard, smartBannerPortrait, smartBannerLandscape
  style = {},
  testMode = __DEV__, // Use test ads in development by default
  onAdLoaded = null,
  onAdFailedToLoad = null,
  onAdOpened = null,
  onAdClosed = null,
  onAdLeftApplication = null,
}) => {
  const [adError, setAdError] = useState(null);
  const [isAdReady, setIsAdReady] = useState(false);
  const [showAd, setShowAd] = useState(false);

  // Google AdMob Test IDs
  const TEST_AD_UNIT_IDS = {
    banner: 'ca-app-pub-3940256099942544/6300978111',
    largeBanner: 'ca-app-pub-3940256099942544/6300978111',
    mediumRectangle: 'ca-app-pub-3940256099942544/6300978111',
    fullBanner: 'ca-app-pub-3940256099942544/6300978111',
    leaderboard: 'ca-app-pub-3940256099942544/6300978111',
  };

  // Ad size configurations
  const adSizeMap = {
    'banner': 'banner',
    'large-banner': 'largeBanner',
    'largeBanner': 'largeBanner',
    'medium-rectangle': 'mediumRectangle',
    'mediumRectangle': 'mediumRectangle',
    'full-banner': 'fullBanner',
    'fullBanner': 'fullBanner',
    'leaderboard': 'leaderboard',
    'smart-banner': 'smartBannerPortrait',
    'smartBanner': 'smartBannerPortrait',
    'smartBannerPortrait': 'smartBannerPortrait',
    'smartBannerLandscape': 'smartBannerLandscape',
  };

  useEffect(() => {
    if (Platform.OS === 'web') {
      setAdError('AdMob is not supported on web platform. Use AdSense instead.');
      return;
    }

    if (!adUnitId) {
      setAdError('AdMob Ad Unit ID is required');
      return;
    }

    initializeAdMob();
  }, [adUnitId, testMode]);

  const initializeAdMob = async () => {
    try {
      // Set test device ID in development mode
      if (testMode || __DEV__) {
        await setTestDeviceIDAsync('EMULATOR');
      }

      // Small delay to ensure AdMob is ready
      setTimeout(() => {
        setShowAd(true);
      }, 100);
    } catch (error) {
      console.error('AdMob initialization error:', error);
      setAdError(error.message);
    }
  };

  const handleAdViewDidReceiveAd = () => {
    setIsAdReady(true);
    setAdError(null);
    if (onAdLoaded) {
      onAdLoaded();
    }
  };

  const handleDidFailToReceiveAdWithError = (error) => {
    console.error('AdMob failed to load:', error);
    setAdError(error);
    setIsAdReady(false);
    if (onAdFailedToLoad) {
      onAdFailedToLoad(error);
    }
  };

  const handleAdViewWillPresentScreen = () => {
    if (onAdOpened) {
      onAdOpened();
    }
  };

  const handleAdViewWillDismissScreen = () => {
    if (onAdClosed) {
      onAdClosed();
    }
  };

  const handleAdViewDidDismissScreen = () => {
    // Ad dismissed
  };

  const handleAdViewWillLeaveApplication = () => {
    if (onAdLeftApplication) {
      onAdLeftApplication();
    }
  };

  // Don't render on web
  if (Platform.OS === 'web') {
    return null;
  }

  // Don't render if no ad unit ID
  if (!adUnitId) {
    return null;
  }

  // Show error state if there's an error
  if (adError && !showAd) {
    if (__DEV__) {
      return (
        <View style={[styles.errorContainer, style]}>
          <Text style={styles.errorText}>AdMob Error</Text>
          <Text style={styles.errorSubtext}>{String(adError)}</Text>
        </View>
      );
    }
    return null; // Don't show error in production
  }

  // Determine which ad unit ID to use
  const finalAdUnitId = (testMode || __DEV__) 
    ? TEST_AD_UNIT_IDS[adSizeMap[adSize]] || TEST_AD_UNIT_IDS.banner
    : adUnitId;

  // Get the correct ad size
  const finalAdSize = adSizeMap[adSize] || 'banner';

  // Don't render until ready
  if (!showAd) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <AdMobBanner
        bannerSize={finalAdSize}
        adUnitID={finalAdUnitId}
        servePersonalizedAds={true}
        onDidFailToReceiveAdWithError={handleDidFailToReceiveAdWithError}
        onAdViewDidReceiveAd={handleAdViewDidReceiveAd}
        onAdViewWillPresentScreen={handleAdViewWillPresentScreen}
        onAdViewWillDismissScreen={handleAdViewWillDismissScreen}
        onAdViewDidDismissScreen={handleAdViewDidDismissScreen}
        onAdViewWillLeaveApplication={handleAdViewWillLeaveApplication}
        style={styles.adBanner}
      />
      {__DEV__ && (
        <View style={styles.devLabel}>
          <Text style={styles.devLabelText}>
            {testMode ? 'TEST AD' : 'LIVE AD'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  adBanner: {
    width: '100%',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 8,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 4,
  },
  errorSubtext: {
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'center',
  },
  devLabel: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  devLabelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
});

export default AdMobComponent;
