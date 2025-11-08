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
    // For Expo Go on physical device, set this to your computer's IP address
    // Find your IP: Windows (ipconfig), Mac/Linux (ifconfig)
    // Example: if Expo shows exp://192.168.1.19:8081, set apiHost to "192.168.1.19"
    apiHost: process.env.EXPO_PUBLIC_API_HOST || "192.168.1.19",
    apiPort: process.env.EXPO_PUBLIC_API_PORT || "5000"
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

