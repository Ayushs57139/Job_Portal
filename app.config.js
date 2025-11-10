export default {
  name: "Free Job Wala",
  slug: "free-job-wala",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#667eea"
  },
  assetBundlePatterns: [
    "**/*"
  ],
  extra: {
    // API Configuration
    // Production: Set EXPO_PUBLIC_API_HOST to your production API domain (e.g., "api.yourdomain.com")
    // Development: Set to your computer's IP address for Expo Go on physical device
    // Find your IP: Windows (ipconfig), Mac/Linux (ifconfig)
    // Example: if Expo shows exp://192.168.1.19:8081, set apiHost to "192.168.1.19"
    apiHost: process.env.EXPO_PUBLIC_API_HOST || (process.env.NODE_ENV === 'production' ? "api.yourdomain.com" : "192.168.1.19"),
    apiPort: process.env.EXPO_PUBLIC_API_PORT || (process.env.NODE_ENV === 'production' ? "443" : "5000")
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.freejobwala.app",
    config: {
      // Replace with your Google AdMob App ID
      // Get it from: https://apps.admob.com/
      googleMobileAdsAppId: "ca-app-pub-3940256099942544~1458002511" // Test App ID
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#667eea"
    },
    package: "com.freejobwala.app",
    config: {
      // Replace with your Google AdMob App ID
      // Get it from: https://apps.admob.com/
      googleMobileAdsAppId: "ca-app-pub-3940256099942544~3347511713" // Test App ID
    }
  },
  web: {
    favicon: "./assets/favicon.png",
    bundler: "metro"
  },
  sdkVersion: "54.0.0"
};

