import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, StyleSheet, View } from 'react-native';
import AdminNavigator from './src/navigation/AdminNavigator';

export default function App() {
  return (
    <SafeAreaProvider style={Platform.OS === 'web' ? { height: '100%' } : undefined}>
      <View style={styles.container}>
        <StatusBar style="light" />
        <AdminNavigator />
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

