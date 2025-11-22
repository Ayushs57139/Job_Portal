// API Configuration and Service for React Native
import AsyncStorage from '@react-native-async-storage/async-storage';

// Safely get Platform - lazy evaluation to avoid runtime errors
const getPlatform = () => {
  try {
    const { Platform } = require('react-native');
    if (Platform && typeof Platform.OS !== 'undefined') {
      return Platform;
    }
  } catch (e) {
    // Platform not ready
  }
  return { OS: 'android' };
};

// Lazy API URL resolution - only resolve when actually needed
let _cachedApiUrl = null;
let _apiHostDetectionAttempted = false;

// Function to detect API host from Expo connection (called lazily)
const detectApiHostFromExpo = () => {
  if (_apiHostDetectionAttempted) {
    return null;
  }
  _apiHostDetectionAttempted = true;
  
  try {
    // Try to get from expo-constants
    const Constants = require('expo-constants');
    console.log('[API Config] Attempting to detect API host from Expo Constants...');
    
    // Log what's available for debugging
    if (Constants) {
      console.log('[API Config] Constants available');
      console.log('[API Config] executionEnvironment:', Constants.executionEnvironment);
      
      // Try expoConfig.extra first (from app.config.js)
      if (Constants.expoConfig && Constants.expoConfig.extra) {
        console.log('[API Config] expoConfig.extra:', JSON.stringify(Constants.expoConfig.extra));
        if (Constants.expoConfig.extra.apiHost) {
          const apiHost = Constants.expoConfig.extra.apiHost;
          console.log(`[API Config] ✅ Using API host from app.config.js: ${apiHost}`);
          return apiHost;
        }
      }
      
      // Try to get from manifest (Expo SDK 49+ uses manifest2, older uses manifest)
      if (Constants.manifest2) {
        console.log('[API Config] Found manifest2');
        const manifest = Constants.manifest2;
        // Try various locations in manifest2
        const hostInfo = manifest.extra?.expoGo?.debuggerHost || 
                        manifest.hostUri ||
                        manifest.debuggerHost ||
                        manifest.extra?.hostUri;
        if (hostInfo) {
          console.log('[API Config] manifest2 hostInfo:', hostInfo);
          const ipMatch = hostInfo.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
          if (ipMatch) {
            console.log(`[API Config] ✅ Detected API host from manifest2: ${ipMatch[1]}`);
            return ipMatch[1];
          }
        }
      }
      
      // Try legacy manifest
      if (Constants.manifest) {
        console.log('[API Config] Found legacy manifest');
        const manifest = Constants.manifest;
        // Try multiple properties that might contain the host
        const hostInfo = manifest.debuggerHost || 
                        manifest.hostUri || 
                        manifest.manifest?.debuggerHost ||
                        manifest.manifest?.hostUri ||
                        (manifest.extra && manifest.extra.expoGo && manifest.extra.expoGo.debuggerHost) ||
                        (manifest.extra && manifest.extra.hostUri);
        
        if (hostInfo) {
          console.log('[API Config] manifest hostInfo:', hostInfo);
          const ipMatch = hostInfo.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
          if (ipMatch) {
            const detectedIP = ipMatch[1];
            console.log(`[API Config] ✅ Detected API host from Expo manifest: ${detectedIP}`);
            return detectedIP;
          }
        } else {
          console.log('[API Config] No hostInfo found in manifest');
        }
      } else {
        console.log('[API Config] No manifest found');
      }
      
      // Try to get from Constants.expoConfig.extra (from app.config.js)
      if (Constants.expoConfig && Constants.expoConfig.extra && Constants.expoConfig.extra.apiHost) {
        const apiHost = Constants.expoConfig.extra.apiHost;
        // Only use if it's an IP address (not a domain)
        if (/^(\d{1,3}\.){3}\d{1,3}$/.test(apiHost)) {
          console.log(`[API Config] ✅ Using API host from app.config.js: ${apiHost}`);
          return apiHost;
        }
      }
    } else {
      console.log('[API Config] Constants not available');
    }
  } catch (e) {
    // expo-constants not available or error reading
    console.log(`[API Config] Error detecting from expo-constants: ${e.message}`);
    console.log('[API Config] Stack:', e.stack);
  }
  
  console.log('[API Config] ❌ Could not auto-detect API host');
  return null;
};

const buildApiUrl = (host, port = '5000') => {
  const protocol = port === '443' ? 'https' : 'http';
  const portSegment = port === '443' ? '' : `:${port}`;
  return `${protocol}://${host}${portSegment}/api`;
};

const getApiUrl = () => {
  // Return cached value if already computed
  if (_cachedApiUrl !== null) {
    return _cachedApiUrl;
  }

  try {
    // Check for explicit API URL in environment variable (highest priority)
    if (typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_API_URL) {
      _cachedApiUrl = process.env.EXPO_PUBLIC_API_URL;
      console.log(`[API Config] Using API URL from EXPO_PUBLIC_API_URL: ${_cachedApiUrl}`);
      return _cachedApiUrl;
    }
    
    // Safely get platform OS with extensive error handling
    // Never access Platform.OS if Platform might not be ready
    let platformOS = 'android'; // default fallback - safest for most cases
    try {
      const Platform = getPlatform();
      // Check if Platform exists and is an object before accessing
      if (Platform && typeof Platform === 'object' && Platform !== null) {
        try {
          const osValue = Platform.OS;
          if (osValue && typeof osValue === 'string') {
            platformOS = osValue;
          }
        } catch (osError) {
          // Platform.OS access failed, use default
          console.warn('Could not access Platform.OS, using default android');
        }
      }
    } catch (e) {
      // Platform itself might not be ready, use default
      console.warn('Platform not ready, using default android');
      platformOS = 'android';
    }
    
    if (platformOS === 'web') {
      // For web, use relative URL or localhost
      // Safely check for window object
      if (typeof window !== 'undefined' && window !== null && window.location && window.location.origin) {
        const origin = window.location.origin;
        // If localhost, use localhost:5000
        if (origin.includes('localhost')) {
          _cachedApiUrl = 'http://localhost:5000/api';
          return _cachedApiUrl;
        }
        // If accessing via IP address (like 192.168.x.x), extract host and use port 5000 for API
        const hostname = window.location.hostname;
        const isIPAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
        if (isIPAddress) {
          _cachedApiUrl = `http://${hostname}:5000/api`;
          return _cachedApiUrl;
        }
        // For other domains, use relative path
        _cachedApiUrl = '/api';
        return _cachedApiUrl;
      }
      _cachedApiUrl = 'http://localhost:5000/api';
      return _cachedApiUrl;
    } else if (platformOS === 'android') {
      // For Android: Use same backend as web - detect from Expo dev server
      let API_HOST = null;
      let API_PORT = '5000';
      
      // 1. Check environment variable (highest priority)
      if (typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_API_HOST) {
        API_HOST = process.env.EXPO_PUBLIC_API_HOST;
        if (process.env.EXPO_PUBLIC_API_PORT) {
          API_PORT = process.env.EXPO_PUBLIC_API_PORT;
        }
      }
      
      // 2. Try to detect from Expo connection (lazy detection) - this gets the dev server IP
      if (!API_HOST) {
        const detectedHost = detectApiHostFromExpo();
        if (detectedHost) {
          API_HOST = detectedHost;
          console.log(`[API Config] ✅ Detected API host from Expo dev server: ${API_HOST}`);
        }
        
        // Also try to get port from expo-constants if available
        if (!API_PORT || API_PORT === '5000') {
          try {
            const Constants = require('expo-constants');
            if (Constants && Constants.expoConfig && Constants.expoConfig.extra && Constants.expoConfig.extra.apiPort) {
              API_PORT = Constants.expoConfig.extra.apiPort;
            }
          } catch (e) {
            // Ignore
          }
        }
      }
      
      // 3. For development, try multiple fallbacks to use same backend as web
      if (!API_HOST) {
        if (__DEV__) {
          // FIRST: Try to extract IP from bundle URL (most accurate - same as Expo dev server)
          // This ensures we use the actual running IP, not a hardcoded one
          try {
            // Try multiple ways to get the bundle URL
            let bundleUrl = null;
            
            // Method 1: React Native SourceCode (most reliable)
            try {
              const RN = require('react-native');
              if (RN.SourceCode) {
                const constants = RN.SourceCode.getConstants ? RN.SourceCode.getConstants() : null;
                if (constants && constants.scriptURL) {
                  bundleUrl = constants.scriptURL;
                  console.log('[API Config] Found bundle URL from SourceCode:', bundleUrl);
                }
              }
            } catch (e) {
              console.log('[API Config] SourceCode method failed:', e.message);
            }
            
            // Method 2: Try NativeModules (alternative method)
            if (!bundleUrl) {
              try {
                const RN = require('react-native');
                if (RN.NativeModules && RN.NativeModules.SourceCode) {
                  const constants = RN.NativeModules.SourceCode.getConstants ? RN.NativeModules.SourceCode.getConstants() : null;
                  if (constants && constants.scriptURL) {
                    bundleUrl = constants.scriptURL;
                    console.log('[API Config] Found bundle URL from NativeModules:', bundleUrl);
                  }
                }
              } catch (e) {
                // Ignore
              }
            }
            
            // Method 3: Try to get from global variables
            if (!bundleUrl && typeof global !== 'undefined') {
              try {
                bundleUrl = global.__DEV_BUNDLE_URL__ || global.__METRO_BUNDLE_URL__ || global.__BUNDLE_URL__;
                if (bundleUrl) {
                  console.log('[API Config] Found bundle URL from global:', bundleUrl);
                }
              } catch (e) {
                // Ignore
              }
            }
            
            // Method 4: Try to extract from error stack (fallback)
            if (!bundleUrl) {
              try {
                const error = new Error();
                if (error.stack) {
                  const stackMatch = error.stack.match(/http[s]?:\/\/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):\d+/);
                  if (stackMatch) {
                    bundleUrl = stackMatch[0];
                    console.log('[API Config] Found bundle URL from error stack:', bundleUrl);
                  }
                }
              } catch (e) {
                // Ignore
              }
            }
            
            if (bundleUrl) {
              const ipMatch = bundleUrl.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
              if (ipMatch) {
                API_HOST = ipMatch[1];
                console.log(`[API Config] ✅ Detected API host from bundle URL: ${API_HOST}`);
              } else {
                console.log('[API Config] Could not extract IP from bundle URL:', bundleUrl);
              }
            } else {
              console.log('[API Config] Could not find bundle URL');
            }
          } catch (e) {
            console.log('[API Config] Error extracting IP from bundle URL:', e.message);
          }
          
          // SECOND: Try to read from app.config.js via expo-constants (fallback)
          if (!API_HOST) {
            try {
              const Constants = require('expo-constants');
              if (Constants && Constants.expoConfig && Constants.expoConfig.extra && Constants.expoConfig.extra.apiHost) {
                API_HOST = Constants.expoConfig.extra.apiHost;
                console.log(`[API Config] ✅ Found API host from Constants.expoConfig.extra: ${API_HOST}`);
              }
            } catch (e) {
              // Ignore
            }
          }
          
          // LAST: If still no host, use Android emulator address (10.0.2.2 maps to host's localhost)
          // This ensures same backend as web when web uses localhost
          if (!API_HOST) {
            API_HOST = '10.0.2.2';
            console.log('[API Config] ✅ Using 10.0.2.2 (maps to host localhost, same as web backend)');
          }
        } else {
          // ---------- PRODUCTION (stand‑alone APK / AAB) ----------
          // For production we should NEVER hard‑code a local IP.
          // Instead we rely on:
          //   1) EXPO_PUBLIC_API_URL  (already handled at top of getApiUrl)
          //   2) EXPO_PUBLIC_API_HOST / EXPO_PUBLIC_API_PORT
          //   3) app.config.js -> extra.apiHost / extra.apiPort
          //
          // This lets you point the built app at any reachable backend
          // (public domain, public IP, or LAN IP) without changing code.

          // Try to read from expo-constants (app.config.js -> extra)
          if (!API_HOST || !API_PORT || API_PORT === '5000') {
            try {
              const Constants = require('expo-constants');
              if (Constants?.expoConfig?.extra) {
                const extra = Constants.expoConfig.extra;
                if (extra.apiHost) {
                  API_HOST = extra.apiHost;
                  console.log(`[API Config] ✅ Using API host from app.config.js extra.apiHost: ${API_HOST}`);
                }
                if (extra.apiPort) {
                  API_PORT = extra.apiPort;
                  console.log(`[API Config] ✅ Using API port from app.config.js extra.apiPort: ${API_PORT}`);
                }
              }
            } catch (e) {
              console.log('[API Config] Could not read expo constants in production:', e.message);
            }
          }

          // Final safety fallback – only if nothing else was configured.
          // NOTE: You should set EXPO_PUBLIC_API_URL or EXPO_PUBLIC_API_HOST
          // when building so this branch is normally NOT used.
          if (!API_HOST) {
            API_HOST = 'admin.freejobwala.org';
            API_PORT = '443';
            console.log('[API Config] ⚠️ Using default production API host admin.freejobwala.org – override via EXPO_PUBLIC_API_HOST / app.config.js');
          }
        }
      }
      
      _cachedApiUrl = buildApiUrl(API_HOST, API_PORT);
      console.log(`[API Config] Android - Final API URL: ${_cachedApiUrl}`);
      return _cachedApiUrl;
    } else {
      // For iOS simulator and physical devices
      let API_HOST = null;
      let API_PORT = '5000';
      
      // 1. Check environment variable
      if (typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_API_HOST) {
        API_HOST = process.env.EXPO_PUBLIC_API_HOST;
        if (process.env.EXPO_PUBLIC_API_PORT) {
          API_PORT = process.env.EXPO_PUBLIC_API_PORT;
        }
      }
      
      // 2. Try to detect from Expo connection
      if (!API_HOST) {
        const detectedHost = detectApiHostFromExpo();
        if (detectedHost) {
          API_HOST = detectedHost;
        }
      }
      
      // 3. Fallback to localhost
      if (!API_HOST) {
        API_HOST = 'localhost';
      }
      
      _cachedApiUrl = buildApiUrl(API_HOST, API_PORT);
      console.log(`[API Config] iOS - Final API URL: ${_cachedApiUrl}`);
      return _cachedApiUrl;
    }
  } catch (error) {
    console.warn('Error in getApiUrl, using default:', error);
    _cachedApiUrl = 'http://localhost:5000/api';
    return _cachedApiUrl;
  }
};

// Get API URL - lazy initialization (only called when needed)
const getAPIBaseURL = () => {
  if (_cachedApiUrl === null) {
    try {
      getApiUrl();
    } catch (error) {
      // If getApiUrl fails, use safe default for Android
      console.warn('Error in getApiUrl, using safe default:', error);
      _cachedApiUrl = 'http://10.0.2.2:5000/api';
    }
  }
  return _cachedApiUrl || 'http://10.0.2.2:5000/api';
};

class JobWalaAPI {
  constructor() {
    // Don't resolve API URL in constructor - resolve lazily when needed
    this._baseURL = null;
    this.token = null;
    // Don't call init in constructor - make it lazy
    this._initPromise = null;
  }

  // Lazy getter for baseURL
  get baseURL() {
    if (this._baseURL === null) {
      this._baseURL = getAPIBaseURL();
    }
    return this._baseURL;
  }

  set baseURL(value) {
    this._baseURL = value;
  }

  async init() {
    if (this._initPromise) {
      return this._initPromise;
    }
    this._initPromise = this._doInit();
    return this._initPromise;
  }

  async _doInit() {
    try {
      if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
        this.token = await AsyncStorage.getItem('token');
      }
    } catch (error) {
      console.warn('Error initializing token from storage:', error);
      this.token = null;
    }
  }
  
  // Set custom API URL (useful for production)
  setApiUrl(url) {
    this.baseURL = url;
  }

  // Format currency in Indian format
  formatIndianCurrency(amount) {
    if (!amount || isNaN(amount)) return '₹0';
    return '₹' + parseInt(amount).toLocaleString('en-IN');
  }

  // Format date in Indian format
  formatIndianDate(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = d.getDate().toString().padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // Format date with time in Indian format
  formatIndianDateTime(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = d.getDate().toString().padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  }

  // Set authentication token
  async setToken(token) {
    this.token = token;
    await AsyncStorage.setItem('token', token);
  }

  // Clear authentication token
  async clearToken() {
    this.token = null;
    await AsyncStorage.multiRemove(['token', 'user', 'currentUser']);
  }

  // Get headers for API requests
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Test API connection with detailed debugging
  async testConnection() {
    const timestamp = new Date().toISOString();
    console.log(`\n${'='.repeat(80)}`);
    console.log(`[DEBUG ${timestamp}] Starting API Connection Test`);
    console.log(`[DEBUG] Base URL: ${this.baseURL}`);
    console.log(`[DEBUG] Platform: ${Platform?.OS || 'unknown'}`);
    console.log(`[DEBUG] __DEV__: ${__DEV__}`);
    
    try {
      const testUrl = `${this.baseURL}/health`;
      console.log(`[DEBUG] Testing connection to: ${testUrl}`);
      
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch(testUrl, {
          method: 'GET',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' }
        });
        
        clearTimeout(timeoutId);
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`[DEBUG] Response received in ${duration}ms`);
        console.log(`[DEBUG] Status: ${response.status} ${response.statusText}`);
        console.log(`[DEBUG] Headers:`, JSON.stringify(Object.fromEntries(response.headers.entries())));
        
        if (response.ok) {
          const data = await response.json().catch(() => ({}));
          console.log(`[DEBUG] ✅ Connection successful!`);
          console.log(`[DEBUG] Response data:`, JSON.stringify(data).substring(0, 200));
          return { success: true, duration, status: response.status };
        } else {
          console.log(`[DEBUG] ⚠️ Server responded but with error status`);
          return { success: false, duration, status: response.status, error: 'Server error' };
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`[DEBUG] ❌ Connection failed after ${duration}ms`);
        console.log(`[DEBUG] Error name: ${fetchError.name}`);
        console.log(`[DEBUG] Error message: ${fetchError.message}`);
        console.log(`[DEBUG] Error stack:`, fetchError.stack?.substring(0, 500));
        
        // Try to diagnose the issue
        if (fetchError.name === 'AbortError') {
          console.log(`[DEBUG] 🔍 Diagnosis: Request timed out - server not responding`);
          console.log(`[DEBUG] 🔍 Possible causes:`);
          console.log(`[DEBUG]    - Server is not running`);
          console.log(`[DEBUG]    - Firewall blocking connection`);
          console.log(`[DEBUG]    - Wrong IP address (10.0.2.2 for emulator, your IP for device)`);
          console.log(`[DEBUG]    - Server crashed or database connection failed`);
        } else if (fetchError.message.includes('Network request failed')) {
          console.log(`[DEBUG] 🔍 Diagnosis: Network request failed`);
          console.log(`[DEBUG] 🔍 Possible causes:`);
          console.log(`[DEBUG]    - No internet connection`);
          console.log(`[DEBUG]    - DNS resolution failed`);
          console.log(`[DEBUG]    - Server unreachable`);
        } else if (fetchError.message.includes('Failed to fetch')) {
          console.log(`[DEBUG] 🔍 Diagnosis: Failed to fetch`);
          console.log(`[DEBUG] 🔍 Possible causes:`);
          console.log(`[DEBUG]    - CORS issue`);
          console.log(`[DEBUG]    - SSL/TLS error`);
          console.log(`[DEBUG]    - Network error`);
        }
        
        return { success: false, duration, error: fetchError.message, errorName: fetchError.name };
      }
    } catch (error) {
      console.log(`[DEBUG] ❌ Test failed with exception:`, error);
      return { success: false, error: error.message };
    } finally {
      console.log(`${'='.repeat(80)}\n`);
    }
  }

  // Make API request
  async request(endpoint, options = {}) {
    const requestId = Math.random().toString(36).substring(7);
    const timestamp = new Date().toISOString();
    
    // Ensure init is called before making requests
    if (!this.token && AsyncStorage) {
      await this.init();
    }

    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: this.getHeaders(),
        ...options,
      };

      console.log(`[API ${requestId}] [${timestamp}] Making request to: ${url}`);
      console.log(`[API ${requestId}] Method: ${options.method || 'GET'}`);
      console.log(`[API ${requestId}] Headers:`, JSON.stringify(config.headers));
      
      // Add timeout for fetch request (30 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      const startTime = Date.now();
      
      try {
        const response = await fetch(url, {
          ...config,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`[API ${requestId}] Response received in ${duration}ms`);
        console.log(`[API ${requestId}] Status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'API request failed' }));
          console.log(`[API ${requestId}] Error response:`, JSON.stringify(errorData).substring(0, 200));
          // Handle validation errors array
          if (errorData.errors && Array.isArray(errorData.errors)) {
            const errorMessages = errorData.errors.map(err => err.msg || err.message || JSON.stringify(err)).join(', ');
            throw new Error(errorMessages);
          }
          throw new Error(errorData.message || 'API request failed');
        }

        const data = await response.json();
        console.log(`[API ${requestId}] ✅ Success response from: ${url}`);
        console.log(`[API ${requestId}] Response size: ${JSON.stringify(data).length} bytes`);
        return data;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`[API ${requestId}] ❌ Request failed after ${duration}ms`);
        console.log(`[API ${requestId}] Error name: ${fetchError.name}`);
        console.log(`[API ${requestId}] Error message: ${fetchError.message}`);
        
        if (fetchError.name === 'AbortError') {
          console.log(`[API ${requestId}] 🔍 Request timed out - server did not respond`);
          throw new Error('Request timeout: Server did not respond within 30 seconds');
        }
        throw fetchError;
      }
    } catch (error) {
      const errorTimestamp = new Date().toISOString();
      console.error(`[API Error ${requestId}] [${errorTimestamp}] Request failed:`, error.message);
      console.error(`[API Error ${requestId}] URL: ${this.baseURL}${endpoint}`);
      console.error(`[API Error ${requestId}] Full error:`, error);
      console.error(`[API Error ${requestId}] Error type:`, error.constructor.name);
      console.error(`[API Error ${requestId}] Error stack:`, error.stack?.substring(0, 500));
      
      // Provide helpful error message for connection issues
      if (error.message.includes('Network request failed') || 
          error.message.includes('Failed to fetch') ||
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('timeout') ||
          error.message.includes('aborted')) {
        console.error(`[API Error ${requestId}] 🔍 Connection failed! Diagnostic info:`);
        console.error(`[API Error ${requestId}]   1. Backend server is running on port 5000`);
        console.error(`[API Error ${requestId}]   2. API URL is correct: ${this.baseURL}`);
        console.error(`[API Error ${requestId}]   3. For Android emulator, server should be accessible at 10.0.2.2:5000`);
        console.error(`[API Error ${requestId}]   4. For physical device/APK, set EXPO_PUBLIC_API_HOST to your server IP`);
        console.error(`[API Error ${requestId}]   5. Check firewall settings and ensure database is connected on server`);
        console.error(`[API Error ${requestId}]   6. Test server manually: curl ${this.baseURL}/health`);
        throw new Error(`Cannot connect to backend server at ${this.baseURL}. Please check if the server is running and database is connected.`);
      }
      
      throw error;
    }
  }

  // Authentication APIs
  async login(credentials) {
    let endpoint = '/auth/login';
    if (credentials.userType === 'jobseeker') {
      endpoint = '/jobseeker/login';
    } else if (credentials.userType === 'employer') {
      endpoint = '/employer/login';
    }

    const data = await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (data.token) {
      await this.setToken(data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      await AsyncStorage.setItem('currentUser', JSON.stringify(data.user));
    }

    return data;
  }

  async companyLogin(credentials) {
    const data = await this.request('/company/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (data.token) {
      await this.setToken(data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      await AsyncStorage.setItem('currentUser', JSON.stringify(data.user));
    }

    return data;
  }

  async consultancyLogin(credentials) {
    const data = await this.request('/consultancy/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (data.token) {
      await this.setToken(data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      await AsyncStorage.setItem('currentUser', JSON.stringify(data.user));
    }

    return data;
  }

  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (data.token) {
      await this.setToken(data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      await AsyncStorage.setItem('currentUser', JSON.stringify(data.user));
    }

    return data;
  }

  async companyRegister(userData) {
    console.log('companyRegister called with:', userData);
    const data = await this.request('/company/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    console.log('companyRegister response data:', data);

    if (data && data.token) {
      console.log('Token received, saving to storage...');
      await this.setToken(data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      await AsyncStorage.setItem('currentUser', JSON.stringify(data.user));
      console.log('Token and user data saved successfully');
    } else {
      console.log('No token in response data');
    }

    return data;
  }

  async consultancyRegister(userData) {
    console.log('consultancyRegister called with:', userData);
    const data = await this.request('/consultancy/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    console.log('consultancyRegister response data:', data);

    if (data && data.token) {
      console.log('Token received, saving to storage...');
      await this.setToken(data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      await AsyncStorage.setItem('currentUser', JSON.stringify(data.user));
      console.log('Token and user data saved successfully');
    } else {
      console.log('No token in response data');
    }

    return data;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await this.clearToken();
    }
  }

  async getCurrentUser() {
    try {
      const data = await this.request('/auth/me');
      await AsyncStorage.setItem('currentUser', JSON.stringify(data.user));
      return data.user;
    } catch (error) {
      await this.clearToken();
      throw error;
    }
  }

  // Job APIs
  async getJobs(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/jobs?${params}`);
  }

  async getJob(id) {
    return await this.request(`/jobs/${id}`);
  }

  async createJob(jobData) {
    return await this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async updateJob(id, jobData) {
    return await this.request(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });
  }

  async deleteJob(id) {
    return await this.request(`/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  async getMyJobs() {
    return await this.request('/jobs/employer/my-jobs');
  }

  async searchJobs(query) {
    return await this.request(`/jobs/search/suggestions?q=${encodeURIComponent(query)}`);
  }

  // Application APIs
  async applyForJob(jobId, applicationData) {
    return await this.request('/applications', {
      method: 'POST',
      body: JSON.stringify({ jobId, ...applicationData }),
    });
  }

  async applyForJobDirect(jobId, applicationData) {
    return await this.request('/applications/direct', {
      method: 'POST',
      body: JSON.stringify({ jobId, ...applicationData }),
    });
  }

  async getMyApplications() {
    return await this.request('/applications/my-applications');
  }

  async getJobApplications(jobId) {
    return await this.request(`/applications/job/${jobId}`);
  }

  async updateApplicationStatus(applicationId, status) {
    return await this.request(`/applications/${applicationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Company APIs
  async getCompanies(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/company?${params}`);
  }

  async getCompany(id) {
    return await this.request(`/company/${id}`);
  }

  async createCompany(companyData) {
    return await this.request('/company', {
      method: 'POST',
      body: JSON.stringify(companyData),
    });
  }

  async updateCompany(id, companyData) {
    return await this.request(`/company/${id}`, {
      method: 'PUT',
      body: JSON.stringify(companyData),
    });
  }

  // Blog APIs
  async getBlogs(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/blogs?${params}`);
  }

  async getBlog(slug) {
    return await this.request(`/blogs/${slug}`);
  }

  async createBlog(blogData) {
    return await this.request('/blogs', {
      method: 'POST',
      body: JSON.stringify(blogData),
    });
  }

  // Admin APIs
  async getAdminStats() {
    return await this.request('/admin/stats');
  }

  async getAdminDashboard() {
    return await this.request('/admin/dashboard');
  }

  async getAllUsers(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/admin/users?${params}`);
  }

  async getAllJobs(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/admin/jobs?${params}`);
  }

  // Utility methods
  async isAuthenticated() {
    return !!this.token;
  }

  async getCurrentUserFromStorage() {
    const user = await AsyncStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  async hasRole(role) {
    const user = await this.getCurrentUserFromStorage();
    return user && user.userType === role;
  }

  async hasAnyRole(roles) {
    const user = await this.getCurrentUserFromStorage();
    return user && roles.includes(user.userType);
  }

  async isEmployer() {
    return await this.hasAnyRole(['company', 'consultancy']);
  }

  async isAdmin() {
    return await this.hasAnyRole(['admin', 'superadmin']);
  }

  // Employer Dashboard APIs
  async getEmployerDashboard() {
    return await this.request('/employers/dashboard');
  }

  async getEmployerStats() {
    return await this.request('/employers/stats');
  }

  async getEmployerJobs(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/employers/jobs?${params}`);
  }

  async getJobApplicationsForEmployer(jobId) {
    return await this.request(`/employers/jobs/${jobId}/applications`);
  }

  // Admin Dashboard APIs
  async getAdminDashboardData() {
    return await this.request('/admin/dashboard');
  }

  async getUsersForAdmin(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/admin/users?${params}`);
  }

  async getJobsForAdmin(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/admin/jobs?${params}`);
  }

  async getApplicationsForAdmin(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/admin/applications?${params}`);
  }

  async updateUserStatus(userId, status) {
    return await this.request(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteUser(userId) {
    return await this.request(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async approveJob(jobId) {
    return await this.request(`/admin/jobs/${jobId}/approve`, {
      method: 'PUT',
    });
  }

  async rejectJob(jobId, reason) {
    return await this.request(`/admin/jobs/${jobId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  // User Dashboard APIs
  async getUserDashboardStats() {
    return await this.request('/users/dashboard-stats');
  }

  // Saved Jobs APIs
  async getSavedJobs() {
    return await this.request('/saved-jobs');
  }

  async saveJob(jobId) {
    return await this.request('/saved-jobs', {
      method: 'POST',
      body: JSON.stringify({ jobId }),
    });
  }

  async unsaveJob(jobId) {
    return await this.request(`/saved-jobs/unsave/${jobId}`, {
      method: 'DELETE',
    });
  }

  // Profile APIs
  async updateProfile(profileData) {
    return await this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // User Profile APIs (comprehensive profile)
  async getUserProfile() {
    return await this.request('/user-profiles/me');
  }

  async saveUserProfile(profileData) {
    return await this.request('/user-profiles', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async getUserProfileForAdmin(userId) {
    return await this.request(`/user-profiles/${userId}`);
  }

  // Change Password API
  async changePassword(passwordData) {
    return await this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  // Master Data APIs
  async getJobTitles(limit = 50) {
    return await this.request(`/job-titles/popular?limit=${limit}`);
  }

  async searchJobTitles(query, limit = 10) {
    return await this.request(`/job-titles/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  }

  async getJobRoles(limit = 50) {
    return await this.request(`/job-roles/popular?limit=${limit}`);
  }

  async searchJobRoles(query, limit = 10) {
    return await this.request(`/job-roles/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  }

  async getAllJobRoles() {
    return await this.request('/job-roles');
  }

  async getAllIndustries() {
    return await this.request('/industries');
  }

  async getIndustrySubcategories(industryName) {
    return await this.request(`/industries/${encodeURIComponent(industryName)}/subcategories`);
  }

  async getAllDepartments() {
    return await this.request('/departments');
  }

  async getDepartmentSubcategories(departmentName) {
    return await this.request(`/departments/${encodeURIComponent(departmentName)}/subcategories`);
  }

  async searchSkills(query, limit = 12) {
    return await this.request(`/skills/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  }

  async getPopularSkills(limit = 50) {
    return await this.request(`/skills/popular?limit=${limit}`);
  }

  async uploadProfilePicture(formData) {
    const url = `${this.baseURL}/users/profile-picture`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });
    return await response.json();
  }

  // Package APIs
  async getPackages(type) {
    const params = type ? `?type=${type}` : '';
    return await this.request(`/packages${params}`);
  }

  // Chat/Messaging APIs
  async getConversations() {
    return await this.request('/chat/conversations');
  }

  async getMessages(conversationId) {
    return await this.request(`/chat/conversations/${conversationId}/messages`);
  }

  async sendMessage(conversationId, content) {
    return await this.request(`/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async createConversation(participantId) {
    return await this.request('/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ participantId }),
    });
  }

  // Social Updates APIs
  async getSocialUpdates(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/social-updates?${params}`);
  }

  async getSocialUpdate(id) {
    return await this.request(`/social-updates/${id}`);
  }

  async createSocialUpdate(formData) {
    const url = `${this.baseURL}/social-updates`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });
    return await response.json();
  }

  async updateSocialUpdate(id, formData) {
    const url = `${this.baseURL}/social-updates/${id}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });
    return await response.json();
  }

  async deleteSocialUpdate(id) {
    return await this.request(`/social-updates/${id}`, {
      method: 'DELETE',
    });
  }

  async likeSocialUpdate(id) {
    return await this.request(`/social-updates/${id}/like`, {
      method: 'POST',
    });
  }

  async commentOnSocialUpdate(id, content) {
    return await this.request(`/social-updates/${id}/comment`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async shareSocialUpdate(id, platform) {
    return await this.request(`/social-updates/${id}/share`, {
      method: 'POST',
      body: JSON.stringify({ platform }),
    });
  }

  async getMySocialUpdates(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/social-updates/user/me?${params}`);
  }

  async getTrendingSocialUpdates(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/social-updates/trending?${params}`);
  }

  // Job Alert APIs
  async createJobAlert(formData) {
    const url = `${this.baseURL}/job-alerts`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': this.token ? `Bearer ${this.token}` : undefined,
      },
      body: formData,
    });
    return await response.json();
  }

  async getJobAlerts(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/job-alerts?${params}`);
  }

  async getJobAlert(id) {
    return await this.request(`/job-alerts/${id}`);
  }

  async updateJobAlert(id, data) {
    return await this.request(`/job-alerts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteJobAlert(id) {
    return await this.request(`/job-alerts/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleJobAlertStatus(id) {
    return await this.request(`/job-alerts/${id}/toggle-status`, {
      method: 'POST',
    });
  }

  async getJobAlertStats() {
    return await this.request('/job-alerts/stats/summary');
  }

  async exportJobAlerts() {
    const url = `${this.baseURL}/job-alerts/export/csv`;
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });
    return await response.blob();
  }

  // Chat APIs - Live Chat Support
  async getConversations(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/chat/conversations?${params}`);
  }

  async getConversation(conversationId) {
    return await this.request(`/chat/conversations/${conversationId}`);
  }

  async getConversationMessages(conversationId, page = 1, limit = 50) {
    return await this.request(`/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`);
  }

  async sendMessage(conversationId, content, replyTo = null) {
    return await this.request(`/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, replyTo }),
    });
  }

  async createConversation(participants, conversationType, subject = null, metadata = {}) {
    return await this.request('/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ participants, conversationType, subject, metadata }),
    });
  }

  async getChatPartners(search = '') {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return await this.request(`/chat/chat-partners${params}`);
  }

  async markConversationAsRead(conversationId) {
    return await this.request(`/chat/conversations/${conversationId}/read`, {
      method: 'PUT',
    });
  }

  async getChatRooms(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/chat/rooms?${params}`);
  }

  async createChatRoom(name, description, roomType, isPublic = false, settings = {}, metadata = {}) {
    return await this.request('/chat/rooms', {
      method: 'POST',
      body: JSON.stringify({ name, description, roomType, isPublic, settings, metadata }),
    });
  }

  async joinChatRoom(roomId) {
    return await this.request(`/chat/rooms/${roomId}/join`, {
      method: 'POST',
    });
  }

  async leaveChatRoom(roomId) {
    return await this.request(`/chat/rooms/${roomId}/leave`, {
      method: 'POST',
    });
  }

  // Platform Settings APIs
  async getSettings() {
    return await this.request('/settings');
  }

  async updateGeneralSettings(data) {
    return await this.request('/settings/general', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateSecuritySettings(data) {
    return await this.request('/settings/security', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateEmailSettings(data) {
    return await this.request('/settings/email', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async sendTestEmail(testEmail) {
    return await this.request('/settings/email/test', {
      method: 'POST',
      body: JSON.stringify({ testEmail }),
    });
  }

  async updatePaymentSettings(data) {
    return await this.request('/settings/payment', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateNotificationSettings(data) {
    return await this.request('/settings/notifications', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async resetSettings(section = null) {
    return await this.request('/settings/reset', {
      method: 'POST',
      body: JSON.stringify({ section }),
    });
  }

  // Theme & Logo Management APIs
  async getActiveTheme() {
    return await this.request('/theme/active');
  }

  async getAllThemes() {
    return await this.request('/theme');
  }

  async createTheme(data) {
    return await this.request('/theme', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTheme(id, data) {
    return await this.request(`/theme/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async activateTheme(id) {
    return await this.request(`/theme/${id}/activate`, {
      method: 'PUT',
    });
  }

  async deleteTheme(id) {
    return await this.request(`/theme/${id}`, {
      method: 'DELETE',
    });
  }

  // Logo Management APIs
  async getActiveLogo() {
    return await this.request('/logos/active');
  }

  async getAllLogos(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/admin/logos?${params}`);
  }

  async getLogoById(id) {
    return await this.request(`/admin/logos/${id}`);
  }

  async createLogo(data) {
    return await this.request('/admin/logos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLogo(id, data) {
    return await this.request(`/admin/logos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async uploadLogoImage(file) {
    const formData = new FormData();
    formData.append('logo', file);
    
    const url = `${this.baseURL}/admin/logos/upload`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': this.token ? `Bearer ${this.token}` : undefined,
      },
      body: formData,
    });
    return await response.json();
  }

  // Generic Upload API
  async uploadFile(file, type = 'general') {
    const formData = new FormData();
    formData.append('file', file);
    
    const url = `${this.baseURL}/upload/${type}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': this.token ? `Bearer ${this.token}` : undefined,
      },
      body: formData,
    });
    return await response.json();
  }

  async deleteUploadedFile(type, filename) {
    return await this.request(`/upload/${type}/${filename}`, {
      method: 'DELETE',
    });
  }

  async activateLogo(id) {
    return await this.request(`/admin/logos/${id}/activate`, {
      method: 'PUT',
    });
  }

  async deleteLogo(id) {
    return await this.request(`/admin/logos/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== EMAIL TEMPLATE MANAGEMENT APIs ====================
  
  async getEmailTemplates(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/admin/email-templates?${params}`);
  }

  async getEmailTemplate(id) {
    return await this.request(`/admin/email-templates/${id}`);
  }

  async createEmailTemplate(data) {
    return await this.request('/admin/email-templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEmailTemplate(id, data) {
    return await this.request(`/admin/email-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEmailTemplate(id) {
    return await this.request(`/admin/email-templates/${id}`, {
      method: 'DELETE',
    });
  }

  async setDefaultEmailTemplate(id) {
    return await this.request(`/admin/email-templates/${id}/set-default`, {
      method: 'POST',
    });
  }

  async getEmailTemplateStats() {
    return await this.request('/admin/email-templates/stats');
  }

  async testEmailTemplate(templateId, testEmail, variables = {}) {
    return await this.request('/admin/email-templates/test', {
      method: 'POST',
      body: JSON.stringify({ templateId, testEmail, variables }),
    });
  }

  async initializeDefaultEmailTemplates() {
    return await this.request('/admin/email-templates/initialize-defaults', {
      method: 'POST',
    });
  }

  // ==================== EMAIL LOG APIs ====================
  
  async getEmailLogs(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/admin/email-logs?${params}`);
  }

  async getEmailLog(id) {
    return await this.request(`/admin/email-logs/${id}`);
  }

  async getEmailLogStats(startDate = null, endDate = null) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return await this.request(`/admin/email-logs/stats?${params}`);
  }

  async retryEmailLog(id) {
    return await this.request(`/admin/email-logs/${id}/retry`, {
      method: 'POST',
    });
  }

  async deleteOldEmailLogs(olderThanDays) {
    return await this.request(`/admin/email-logs?olderThan=${olderThanDays}`, {
      method: 'DELETE',
    });
  }

  // ==================== SMTP SETTINGS APIs ====================
  
  async getSMTPSettings() {
    return await this.request('/settings');
  }

  async updateSMTPSettings(data) {
    return await this.request('/settings/email', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async testSMTPConnection(testEmail) {
    return await this.request('/settings/email/test', {
      method: 'POST',
      body: JSON.stringify({ testEmail }),
    });
  }

  // ==================== SOCIAL UPDATES ADMIN APIs ====================
  
  async getAdminSocialUpdates(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/social-updates/public/all?${params}`);
  }

  async getSocialUpdateStats() {
    // Calculate stats from recent data
    try {
      const response = await this.request('/social-updates/public/all?limit=1000');
      const updates = response.socialUpdates || [];
      
      return {
        total: response.pagination?.totalItems || 0,
        published: updates.filter(u => u.status === 'published').length,
        draft: updates.filter(u => u.status === 'draft').length,
        totalLikes: updates.reduce((sum, u) => sum + (u.engagement?.likes || 0), 0),
        totalComments: updates.reduce((sum, u) => sum + (u.engagement?.comments || 0), 0),
        totalShares: updates.reduce((sum, u) => sum + (u.engagement?.shares || 0), 0),
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        total: 0,
        published: 0,
        draft: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
      };
    }
  }

  async moderateSocialUpdate(id, action, notes = '') {
    return await this.request(`/social-updates/admin/${id}/moderate`, {
      method: 'PUT',
      body: JSON.stringify({ action, notes }),
    });
  }

  async deleteSocialUpdate(id) {
    return await this.request(`/social-updates/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== KYC APIs ====================
  
  async submitKYC(formData) {
    const url = `${this.baseURL}/kyc/submit`;
    const formDataToSend = new FormData();
    
    // Add text fields
    if (formData.userType) formDataToSend.append('userType', formData.userType);
    if (formData.companyType) formDataToSend.append('companyType', formData.companyType);
    if (formData.documents) {
      Object.keys(formData.documents).forEach(key => {
        const doc = formData.documents[key];
        if (doc && doc.idNumber) {
          formDataToSend.append(`documents[${key}]`, JSON.stringify({ idNumber: doc.idNumber }));
        }
      });
    }
    
    // Add files
    if (formData.files) {
      Object.keys(formData.files).forEach(key => {
        if (formData.files[key]) {
          formDataToSend.append(key, {
            uri: formData.files[key].uri,
            type: formData.files[key].type,
            name: formData.files[key].name,
          });
        }
      });
    }
    
    const headers = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formDataToSend,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'KYC submission failed');
    }
    
    return data;
  }

  async uploadKYCDocument(documentType, file, idNumber) {
    const url = `${this.baseURL}/kyc/upload`;
    const formData = new FormData();
    
    formData.append('documentType', documentType);
    if (idNumber) formData.append('idNumber', idNumber);
    formData.append(documentType, {
      uri: file.uri,
      type: file.type,
      name: file.name,
    });
    
    const headers = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Document upload failed');
    }
    
    return data;
  }

  async getKYCStatus() {
    return await this.request('/kyc/status');
  }

  // Company Profile APIs
  async getCompanyProfile() {
    return await this.request('/company/me');
  }

  async updateCompanyProfile(profileData) {
    return await this.request('/company/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Consultancy Profile APIs
  async getConsultancyProfile() {
    return await this.request('/consultancy/me');
  }

  async updateConsultancyProfile(profileData) {
    return await this.request('/consultancy/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Popular Searches APIs
  async getPopularSearches(limit = 10) {
    return await this.request(`/popular-searches?limit=${limit}`);
  }

  async trackPopularSearchClick(searchId) {
    return await this.request(`/popular-searches/${searchId}/click`, {
      method: 'POST',
    });
  }

  async trackSearch(searchQuery) {
    return await this.request('/popular-searches/track-search', {
      method: 'POST',
      body: JSON.stringify({ searchQuery }),
    });
  }

  // Trending Job Roles APIs
  async getTrendingJobRoles(limit = 12) {
    return await this.request(`/job-roles/trending?limit=${limit}`);
  }

  async getPopularJobRoles(limit = 12) {
    return await this.request(`/job-roles/popular?limit=${limit}`);
  }

  // Add new job title
  async addJobTitle(name, category = 'Other') {
    return await this.request('/job-titles', {
      method: 'POST',
      body: JSON.stringify({ name, category }),
    });
  }

  // Add new key skill
  async addKeySkill(name, category = 'Other', skillType = 'Technical') {
    return await this.request('/key-skills', {
      method: 'POST',
      body: JSON.stringify({ name, category, skillType }),
    });
  }

  // Add new job role
  async addJobRole(name, category = 'Other') {
    return await this.request('/job-roles', {
      method: 'POST',
      body: JSON.stringify({ name, category }),
    });
  }

  // Search companies
  async searchCompanies(query) {
    return await this.request(`/companies/search?q=${encodeURIComponent(query)}`);
  }

  // Add new company
  async addCompany(name) {
    return await this.request('/companies', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }
}

// Create API instance safely
let apiInstance;
try {
  apiInstance = new JobWalaAPI();
} catch (error) {
  console.error('Error creating API instance:', error);
  // Create a minimal fallback instance to prevent crashes
  apiInstance = {
    _baseURL: null,
    get baseURL() {
      if (this._baseURL === null) {
        this._baseURL = getAPIBaseURL();
      }
      return this._baseURL;
    },
    set baseURL(value) { this._baseURL = value; },
    token: null,
    async init() {},
    async request() { throw new Error('API not initialized'); },
    getHeaders: () => ({ 'Content-Type': 'application/json' })
  };
}

// Export both the API instance and the base URL for direct use
// Use a safe default that doesn't require Platform to be initialized
// The actual URL will be computed lazily when getAPIBaseURL() is called
const API_URL = (() => {
  try {
    // Try to get the API URL, but don't fail if Platform isn't ready
    const url = getAPIBaseURL();
    return url;
  } catch (error) {
    // If anything fails, use a safe default for Android (most common case)
    // This will work for emulator and can be overridden via environment variable
    return 'http://10.0.2.2:5000/api';
  }
})();

export default apiInstance;
export { API_URL };
export const api = apiInstance;

