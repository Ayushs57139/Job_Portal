/**
 * Debug Logger Utility
 * Provides enhanced logging for debugging in APK builds
 * Use this instead of console.log for better visibility in logcat
 */

import { Platform } from 'react-native';

const DEBUG_PREFIX = '[JOBWALA_DEBUG]';
const ERROR_PREFIX = '[JOBWALA_ERROR]';
const WARN_PREFIX = '[JOBWALA_WARN]';
const INFO_PREFIX = '[JOBWALA_INFO]';

/**
 * Enhanced logger that works well with adb logcat
 */
export const debugLogger = {
  /**
   * Log debug messages
   */
  log: (...args) => {
    if (__DEV__ || Platform.OS === 'android') {
      console.log(DEBUG_PREFIX, ...args);
    }
  },

  /**
   * Log error messages
   */
  error: (...args) => {
    console.error(ERROR_PREFIX, ...args);
    // Also log with console.log for better logcat visibility on Android
    if (Platform.OS === 'android') {
      console.log(ERROR_PREFIX, ...args);
    }
  },

  /**
   * Log warning messages
   */
  warn: (...args) => {
    console.warn(WARN_PREFIX, ...args);
    // Also log with console.log for better logcat visibility on Android
    if (Platform.OS === 'android') {
      console.log(WARN_PREFIX, ...args);
    }
  },

  /**
   * Log info messages
   */
  info: (...args) => {
    if (__DEV__ || Platform.OS === 'android') {
      console.log(INFO_PREFIX, ...args);
    }
  },

  /**
   * Log API calls
   */
  api: (method, url, data, response) => {
    if (__DEV__ || Platform.OS === 'android') {
      console.log('[JOBWALA_API]', method, url);
      if (data) {
        console.log('[JOBWALA_API_DATA]', JSON.stringify(data, null, 2));
      }
      if (response) {
        console.log('[JOBWALA_API_RESPONSE]', JSON.stringify(response, null, 2));
      }
    }
  },

  /**
   * Log navigation events
   */
  navigation: (action, routeName, params) => {
    if (__DEV__ || Platform.OS === 'android') {
      console.log('[JOBWALA_NAV]', action, routeName, params ? JSON.stringify(params) : '');
    }
  },

  /**
   * Log component lifecycle
   */
  component: (componentName, lifecycle, props) => {
    if (__DEV__ || Platform.OS === 'android') {
      console.log('[JOBWALA_COMPONENT]', componentName, lifecycle, props ? JSON.stringify(props) : '');
    }
  },

  /**
   * Log with a custom tag
   */
  tagged: (tag, ...args) => {
    if (__DEV__ || Platform.OS === 'android') {
      console.log(`[JOBWALA_${tag.toUpperCase()}]`, ...args);
    }
  },

  /**
   * Log object with pretty formatting
   */
  object: (label, obj) => {
    if (__DEV__ || Platform.OS === 'android') {
      console.log(`[JOBWALA_OBJECT] ${label}:`, JSON.stringify(obj, null, 2));
    }
  },

  /**
   * Log stack trace
   */
  stack: (label = 'Stack trace') => {
    if (__DEV__ || Platform.OS === 'android') {
      const stack = new Error().stack;
      console.log(`[JOBWALA_STACK] ${label}:`, stack);
    }
  },
};

export default debugLogger;
