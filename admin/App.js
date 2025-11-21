import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
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

// Enhanced Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    return { 
      hasError: true, 
      error,
      errorId: Date.now().toString(36)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Comprehensive error logging
    console.error('========== ERROR BOUNDARY CAUGHT ERROR ==========');
    console.error('Error:', error);
    console.error('Error Name:', error?.name);
    console.error('Error Message:', error?.message);
    console.error('Error Stack:', error?.stack);
    console.error('Component Stack:', errorInfo?.componentStack);
    console.error('Error ID:', this.state.errorId);
    console.error('==================================================');
    
    // Log to native console for APK debugging
    if (Platform.OS === 'android') {
      console.log('[ERROR_BOUNDARY] Error Name:', error?.name);
      console.log('[ERROR_BOUNDARY] Error Message:', error?.message);
      console.log('[ERROR_BOUNDARY] Error Stack:', error?.stack);
      console.log('[ERROR_BOUNDARY] Component Stack:', errorInfo?.componentStack);
      console.log('[ERROR_BOUNDARY] Error ID:', this.state.errorId);
    }

    this.setState({
      error,
      errorInfo
    });

    // In production, you could send this to an error tracking service
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.title}>⚠️ Something went wrong</Text>
          <Text style={errorStyles.message}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <Text style={errorStyles.subtitle}>
            Please try again or contact support if the problem persists.
          </Text>
          {__DEV__ && this.state.errorInfo && (
            <View style={errorStyles.detailsContainer}>
              <Text style={errorStyles.detailsTitle}>Error ID: {this.state.errorId}</Text>
              <Text style={errorStyles.detailsText}>
                {this.state.errorInfo.componentStack}
              </Text>
            </View>
          )}
          <TouchableOpacity style={errorStyles.button} onPress={this.handleReset}>
            <Text style={errorStyles.buttonText}>Try Again</Text>
          </TouchableOpacity>
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
    color: '#d32f2f',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  detailsContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 20,
    maxWidth: '90%',
    maxHeight: 200,
  },
  detailsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  detailsText: {
    fontSize: 10,
    color: '#999',
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
  },
  button: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

