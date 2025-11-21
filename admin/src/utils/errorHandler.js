/**
 * Centralized Error Handler Utility
 * Provides consistent error handling and user-friendly error messages
 */

import { Alert } from 'react-native';

/**
 * Get user-friendly error message from error object
 */
export const getErrorMessage = (error) => {
  if (!error) {
    return 'An unexpected error occurred. Please try again.';
  }

  // If error is already a string
  if (typeof error === 'string') {
    return error;
  }

  // If error has a message property
  if (error.message) {
    return error.message;
  }

  // Handle specific error types
  if (error.name === 'NetworkError' || error.message?.includes('Network request failed')) {
    return 'Network error. Please check your internet connection and try again.';
  }

  if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }

  if (error.message?.includes('Session expired') || error.message?.includes('401') || error.message?.includes('403')) {
    return 'Your session has expired. Please login again.';
  }

  if (error.message?.includes('500') || error.message?.includes('Server error')) {
    return 'Server error. Please try again later.';
  }

  // Default message
  return 'An error occurred. Please try again.';
};

/**
 * Show error alert to user
 */
export const showError = (error, title = 'Error') => {
  const message = getErrorMessage(error);
  Alert.alert(title, message, [{ text: 'OK' }]);
};

/**
 * Handle API error with logging and user notification
 */
export const handleApiError = (error, context = '') => {
  const errorMessage = getErrorMessage(error);
  
  // Log error for debugging
  console.error(`API Error${context ? ` in ${context}` : ''}:`, {
    message: errorMessage,
    originalError: error,
    stack: error?.stack,
    endpoint: error?.endpoint,
    requestId: error?.requestId
  });

  // Return user-friendly message
  return errorMessage;
};

/**
 * Wrap async function with error handling
 */
export const withErrorHandling = (asyncFn, errorHandler = showError) => {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      if (errorHandler) {
        errorHandler(error);
      }
      throw error;
    }
  };
};

/**
 * Safe async storage operations
 */
export const safeAsyncStorage = {
  getItem: async (key) => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('AsyncStorage getItem error:', error);
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('AsyncStorage setItem error:', error);
      return false;
    }
  },
  removeItem: async (key) => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('AsyncStorage removeItem error:', error);
      return false;
    }
  }
};

