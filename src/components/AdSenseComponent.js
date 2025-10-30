import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

/**
 * Google AdSense Component - Fully Integrated and Dynamic
 * Renders Google AdSense ads on web platform
 * 
 * Usage:
 * <AdSenseComponent
 *   adClient="ca-pub-XXXXXXXXXXXXXXXX"
 *   adSlot="XXXXXXXXXX"
 *   adFormat="auto"
 *   style={{ width: 728, height: 90 }}
 * />
 */
const AdSenseComponent = ({
  adClient,
  adSlot,
  adFormat = 'auto',
  adLayout = '',
  adLayoutKey = '',
  fullWidthResponsive = true,
  style = {},
}) => {
  const adRef = useRef(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [adError, setAdError] = useState(null);

  useEffect(() => {
    // Only load on web platform
    if (Platform.OS !== 'web') {
      return;
    }

    // Validate required props
    if (!adClient || !adSlot) {
      setAdError('AdSense Client ID and Slot ID are required');
      return;
    }

    // Load AdSense script
    loadAdSenseScript();

    return () => {
      // Cleanup if needed
    };
  }, [adClient, adSlot]);

  useEffect(() => {
    // Push ad when script is loaded
    if (isScriptLoaded && Platform.OS === 'web') {
      pushAd();
    }
  }, [isScriptLoaded]);

  const loadAdSenseScript = () => {
    // Check if script already exists
    const existingScript = document.querySelector(
      `script[src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]`
    );

    if (existingScript) {
      setIsScriptLoaded(true);
      return;
    }

    // Create and load script
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-ad-client', adClient);

    script.onload = () => {
      setIsScriptLoaded(true);
    };

    script.onerror = (error) => {
      console.error('Failed to load AdSense script:', error);
      setAdError('Failed to load AdSense script');
    };

    document.head.appendChild(script);
  };

  const pushAd = () => {
    try {
      // Ensure adsbygoogle is available
      if (window.adsbygoogle && adRef.current) {
        // Check if ad has already been pushed
        const ins = adRef.current.querySelector('ins');
        if (ins && ins.getAttribute('data-adsbygoogle-status')) {
          return; // Ad already loaded
        }

        // Push ad
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense push error:', error);
      setAdError('Failed to load AdSense ad');
    }
  };

  // Only render on web
  if (Platform.OS !== 'web') {
    return null;
  }

  // Don't render if required props are missing
  if (!adClient || !adSlot) {
    return null;
  }

  // Calculate dimensions
  const containerStyle = {
    width: style.width || '100%',
    height: style.height || 'auto',
    minHeight: style.height || 90,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...style,
  };

  return (
    <div ref={adRef} style={containerStyle}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          width: style.width || '100%',
          height: style.height || 'auto',
        }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-ad-layout={adLayout}
        data-ad-layout-key={adLayoutKey}
        data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
      />
    </div>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});

export default AdSenseComponent;
