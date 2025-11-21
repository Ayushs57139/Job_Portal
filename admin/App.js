import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, StyleSheet, View, Text } from 'react-native';
import AdminNavigator from './src/navigation/AdminNavigator';

// Inject global styles for web
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    html, body, #root {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
  `;
  document.head.appendChild(style);
}

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.title}>Something went wrong</Text>
          <Text style={errorStyles.message}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <Text style={errorStyles.subtitle}>
            Please refresh the page or contact support if the problem persists.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  // Add web-specific styles to document
  React.useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      // Ensure html and body have full height
      const html = document.documentElement;
      const body = document.body;
      if (html) {
        html.style.height = '100%';
        html.style.margin = '0';
        html.style.padding = '0';
      }
      if (body) {
        body.style.height = '100%';
        body.style.margin = '0';
        body.style.padding = '0';
        body.style.overflow = 'hidden';
      }
      // Ensure root div has full height
      const root = document.getElementById('root');
      if (root) {
        root.style.height = '100%';
        root.style.width = '100%';
      }
    }
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider style={Platform.OS === 'web' ? { height: '100vh', width: '100vw' } : undefined}>
        <View style={styles.container}>
          <StatusBar style="light" />
          <AdminNavigator />
        </View>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      height: '100vh',
      width: '100vw',
      minHeight: '100vh',
      minWidth: '100vw',
    }),
  },
});

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    ...(Platform.OS === 'web' && {
      height: '100vh',
      width: '100vw',
    }),
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
});

