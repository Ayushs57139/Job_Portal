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
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.freejobwala.app"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#667eea"
    },
    package: "com.freejobwala.app"
  },
  web: {
    favicon: "./assets/favicon.png",
    bundler: "metro"
  },
  sdkVersion: "54.0.0"
};

