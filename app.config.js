export default {
  owner: "ayushrex8",
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
    eas: {
      projectId: "d4f855f4-7d0a-4c10-8b02-0c57b57d6de2"
    },
    // API Configuration
    // Production: use your live backend at https://admin.freejobwala.org
    // Development: use your local machine IP so Expo Go on device can reach it
    apiHost:
      process.env.EXPO_PUBLIC_API_HOST ||
      (process.env.NODE_ENV === 'production'
        ? "admin.freejobwala.org"
        : "192.168.1.19"),
    apiPort:
      process.env.EXPO_PUBLIC_API_PORT ||
      (process.env.NODE_ENV === 'production'
        ? "443"
        : "5000")
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

