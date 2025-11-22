import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details to console
    console.error('========== ERROR BOUNDARY CAUGHT ERROR ==========');
    console.error('Error:', error);
    console.error('Error Name:', error?.name);
    console.error('Error Message:', error?.message);
    console.error('Error Stack:', error?.stack);
    console.error('Component Stack:', errorInfo?.componentStack);
    console.error('==================================================');
    
    // Also try to log to native console for APK debugging
    if (getPlatform().OS === 'android') {
      // Use console.log for better compatibility with logcat
      console.log('[ERROR_BOUNDARY] Error Name:', error?.name);
      console.log('[ERROR_BOUNDARY] Error Message:', error?.message);
      console.log('[ERROR_BOUNDARY] Error Stack:', error?.stack);
      console.log('[ERROR_BOUNDARY] Component Stack:', errorInfo?.componentStack);
    }

    this.setState({
      error,
      errorInfo,
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <View style={styles.container}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
            <Text style={styles.title}>⚠️ Something went wrong</Text>
            <Text style={styles.message}>
              {this.state.error && this.state.error.toString()}
            </Text>
            
            {__DEV__ && this.state.errorInfo && (
              <View style={styles.detailsContainer}>
                <Text style={styles.detailsTitle}>Error Details:</Text>
                <Text style={styles.detailsText}>
                  {this.state.errorInfo.componentStack}
                </Text>
                <Text style={styles.detailsTitle}>Stack Trace:</Text>
                <Text style={styles.detailsText}>
                  {this.state.error?.stack}
                </Text>
              </View>
            )}
            
            <TouchableOpacity style={styles.button} onPress={this.handleReset}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
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
    marginBottom: 20,
    textAlign: 'center',
  },
  detailsContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 10,
    marginBottom: 5,
  },
  detailsText: {
    fontSize: 12,
    color: '#999',
    fontFamily: getPlatform().OS === 'android' ? 'monospace' : 'Courier',
  },
  button: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ErrorBoundary;
