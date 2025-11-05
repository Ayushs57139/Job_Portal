import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, StyleSheet, View } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  useEffect(() => {
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
  }, []);

  return (
    <SafeAreaProvider style={Platform.OS === 'web' ? { height: '100%', width: '100%' } : undefined}>
      <View style={styles.container}>
        <StatusBar style="light" />
        <AppNavigator />
      </View>
    </SafeAreaProvider>
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
