import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View, LogBox } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import api from './src/config/api';

// Safely get Platform - lazy evaluation
const getPlatform = () => {
  try {
    const { Platform } = require('react-native');
    if (Platform && typeof Platform.OS !== 'undefined') {
      return Platform;
    }
  } catch (e) {}
  return { OS: 'android' };
};

// Enable LogBox for better error visibility in development
if (__DEV__) {
  LogBox.ignoreLogs([
    // Add any warnings you want to ignore here
    'Non-serializable values were found in the navigation state',
  ]);
} else {
  // In production, still show errors but not warnings
  LogBox.ignoreAllLogs(false);
}

export default function App() {
  useEffect(() => {
    // Setup global error handlers for debugging
    const setupErrorHandlers = () => {
      // Handle unhandled JavaScript errors (React Native)
      if (typeof ErrorUtils !== 'undefined' && ErrorUtils.getGlobalHandler) {
        try {
          const originalErrorHandler = ErrorUtils.getGlobalHandler();
          ErrorUtils.setGlobalHandler((error, isFatal) => {
            console.error('========== GLOBAL ERROR HANDLER ==========');
            console.error('Fatal:', isFatal);
            console.error('Error:', error);
            console.error('Error Name:', error?.name);
            console.error('Error Message:', error?.message);
            console.error('Error Stack:', error?.stack);
            console.error('==========================================');
            
            // Log to native console for APK debugging
            try {
              const Platform = getPlatform();
              if (Platform.OS === 'android') {
                console.log('[GLOBAL_ERROR] Fatal:', isFatal);
                console.log('[GLOBAL_ERROR] Error Name:', error?.name);
                console.log('[GLOBAL_ERROR] Error Message:', error?.message);
                console.log('[GLOBAL_ERROR] Error Stack:', error?.stack);
              }
            } catch (e) {}
            
            // Call original handler
            if (originalErrorHandler) {
              originalErrorHandler(error, isFatal);
            }
          });
        } catch (e) {
          console.warn('Failed to set global error handler:', e);
        }
      }

      // Handle unhandled promise rejections
      const unhandledRejectionHandler = (event) => {
        const reason = event?.reason || event;
        console.error('========== UNHANDLED PROMISE REJECTION ==========');
        console.error('Reason:', reason);
        if (reason) {
          console.error('Error Name:', reason?.name);
          console.error('Error Message:', reason?.message);
          console.error('Error Stack:', reason?.stack);
        }
        console.error('================================================');
        
        // Log to native console for APK debugging
        try {
          const Platform = getPlatform();
          if (Platform.OS === 'android') {
            console.log('[UNHANDLED_REJECTION] Reason:', reason);
            if (reason) {
              console.log('[UNHANDLED_REJECTION] Error Name:', reason?.name);
              console.log('[UNHANDLED_REJECTION] Error Message:', reason?.message);
              console.log('[UNHANDLED_REJECTION] Error Stack:', reason?.stack);
            }
          }
        } catch (e) {}
      };

      // Add listener for unhandled promise rejections (Web)
      if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('unhandledrejection', unhandledRejectionHandler);
      }

      // For React Native, unhandled promise rejections are typically caught
      // by the global error handler, but we can also monitor console.error

      // Enhance console.error for better debugging
      const originalConsoleError = console.error;
      console.error = (...args) => {
        originalConsoleError(...args);
        // Additional logging for APK
        try {
          const Platform = getPlatform();
          if (Platform.OS === 'android') {
            console.log('[CONSOLE_ERROR]', ...args);
          }
        } catch (e) {}
      };

      console.log('✅ Error handlers initialized');
      try {
        const Platform = getPlatform();
        console.log('📱 Platform:', Platform?.OS || 'unknown');
      } catch (e) {
        console.log('📱 Platform: unknown');
      }
      console.log('🔧 __DEV__:', __DEV__);
      console.log('📦 App version: 1.0.0');
    };

    setupErrorHandlers();

    // Test API connection on app startup for debugging
    if (__DEV__) {
      console.log('\n🔍 [APP STARTUP] Testing API connection...');
      setTimeout(async () => {
        try {
          const connectionTest = await api.testConnection();
          if (connectionTest.success) {
            console.log('✅ [APP STARTUP] API connection test PASSED');
          } else {
            console.error('❌ [APP STARTUP] API connection test FAILED');
            console.error('   Error:', connectionTest.error);
            console.error('   Duration:', connectionTest.duration, 'ms');
          }
        } catch (error) {
          console.error('❌ [APP STARTUP] Connection test error:', error.message);
        }
      }, 2000); // Wait 2 seconds for app to initialize
    }

    // Add viewport meta tag for responsive web design
    try {
      const Platform = getPlatform();
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
      let viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        viewport = document.createElement('meta');
        viewport.setAttribute('name', 'viewport');
        document.getElementsByTagName('head')[0].appendChild(viewport);
      }
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
      
      // Add comprehensive responsive and modern minimal CSS
      const style = document.createElement('style');
      style.textContent = `
        * {
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        }
        #root {
          width: 100%;
          height: 100%;
          min-height: 100vh;
        }
        /* Responsive typography scaling */
        @media (max-width: 320px) {
          html { font-size: 14px; }
        }
        @media (min-width: 321px) and (max-width: 375px) {
          html { font-size: 15px; }
        }
        @media (min-width: 376px) and (max-width: 414px) {
          html { font-size: 16px; }
        }
        @media (min-width: 415px) and (max-width: 768px) {
          html { font-size: 16px; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          html { font-size: 17px; }
        }
        @media (min-width: 1025px) and (max-width: 1440px) {
          html { font-size: 18px; }
        }
        @media (min-width: 1441px) {
          html { font-size: 19px; }
        }
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        /* Prevent text selection on buttons and interactive elements */
        button, a, [role="button"] {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        /* Improve touch targets for mobile */
        @media (max-width: 768px) {
          button, a, [role="button"] {
            min-height: 44px;
            min-width: 44px;
          }
        }
        /* Modern minimal scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        /* Responsive images */
        img {
          max-width: 100%;
          height: auto;
        }
        /* Focus styles for accessibility */
        *:focus-visible {
          outline: 2px solid #2563EB;
          outline-offset: 2px;
        }
      `;
      document.getElementsByTagName('head')[0].appendChild(style);
      }
    } catch (e) {}

    // Cleanup function
    return () => {
      if (typeof window !== 'undefined' && window.removeEventListener) {
        window.removeEventListener('unhandledrejection', () => {});
      }
    };
  }, []);

  const getSafeAreaStyle = () => {
    try {
      const Platform = getPlatform();
      return Platform.OS === 'web' ? { height: '100%', width: '100%' } : undefined;
    } catch (e) {
      return undefined;
    }
  };

  return (
    <ErrorBoundary>
      <SafeAreaProvider style={getSafeAreaStyle()}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.container}>
          <StatusBar style="light" />
          <AppNavigator />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const getStyles = () => {
  const getPlatform = () => {
    try {
      const { Platform } = require('react-native');
      if (Platform && typeof Platform.OS !== 'undefined') {
        return Platform;
      }
    } catch (e) {}
    return { OS: 'android' };
  };
  
  const Platform = getPlatform();
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#000', // fallback for devices with transparent system bars
    },
    container: {
      flex: 1,
      ...(Platform.OS === 'web' && {
        height: '100%',
        width: '100%',
      }),
    },
  });
};

const styles = getStyles();
