import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, StyleSheet, View, LogBox } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';

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
            if (Platform.OS === 'android') {
              console.log('[GLOBAL_ERROR] Fatal:', isFatal);
              console.log('[GLOBAL_ERROR] Error Name:', error?.name);
              console.log('[GLOBAL_ERROR] Error Message:', error?.message);
              console.log('[GLOBAL_ERROR] Error Stack:', error?.stack);
            }
            
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
        if (Platform.OS === 'android') {
          console.log('[UNHANDLED_REJECTION] Reason:', reason);
          if (reason) {
            console.log('[UNHANDLED_REJECTION] Error Name:', reason?.name);
            console.log('[UNHANDLED_REJECTION] Error Message:', reason?.message);
            console.log('[UNHANDLED_REJECTION] Error Stack:', reason?.stack);
          }
        }
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
        if (Platform.OS === 'android') {
          console.log('[CONSOLE_ERROR]', ...args);
        }
      };

      console.log('✅ Error handlers initialized');
      console.log('📱 Platform:', Platform.OS);
      console.log('🔧 __DEV__:', __DEV__);
      console.log('📦 App version: 1.0.0');
    };

    setupErrorHandlers();

    // Add viewport meta tag for responsive web design
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      let viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        viewport = document.createElement('meta');
        viewport.setAttribute('name', 'viewport');
        document.getElementsByTagName('head')[0].appendChild(viewport);
      }
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      
      // Add mobile-friendly CSS
      const style = document.createElement('style');
      style.textContent = `
        * {
          box-sizing: border-box;
        }
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        #root {
          width: 100%;
          height: 100%;
        }
      `;
      document.getElementsByTagName('head')[0].appendChild(style);
    }

    // Cleanup function
    return () => {
      if (typeof window !== 'undefined' && window.removeEventListener) {
        window.removeEventListener('unhandledrejection', () => {});
      }
    };
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider style={Platform.OS === 'web' ? { height: '100%', width: '100%' } : undefined}>
        <View style={styles.container}>
          <StatusBar style="light" />
          <AppNavigator />
        </View>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      height: '100%',
      width: '100%',
    }),
  },
});
