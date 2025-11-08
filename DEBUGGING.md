# Debugging Guide for Expo APK

This guide explains how to view error logs and debug issues when running the Expo APK.

## Error Logging Features

The app now includes comprehensive error logging:

1. **Error Boundary** - Catches React component errors
2. **Global Error Handler** - Catches unhandled JavaScript errors
3. **Promise Rejection Handler** - Catches unhandled promise rejections
4. **Enhanced Console Logging** - All errors are logged with prefixes for easy filtering

## Viewing Logs in Development

### Using Expo Dev Tools
When running with `expo start`, errors will appear in:
- Metro bundler terminal
- Expo Dev Tools browser
- Device/Emulator console (shake device to open dev menu)

### Using React Native Debugger
1. Install React Native Debugger
2. Enable Remote JS Debugging from dev menu
3. Open React Native Debugger
4. View console logs and errors

## Viewing Logs in APK (Production Build)

### Method 1: Using ADB Logcat (Recommended)

1. **Connect your Android device via USB** or use an emulator
2. **Enable USB Debugging** on your device:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times to enable Developer Options
   - Go to Settings > Developer Options
   - Enable "USB Debugging"

3. **Open terminal/command prompt** and run:

```bash
# View all logs
adb logcat

# Filter only app logs (recommended)
adb logcat | grep -E "JOBWALA|ReactNative|ERROR|ErrorBoundary"

# Filter only errors
adb logcat | grep -E "ERROR|Error|Exception"

# Filter with specific tags
adb logcat | grep "JOBWALA_ERROR"
adb logcat | grep "JOBWALA_DEBUG"
adb logcat | grep "GLOBAL_ERROR"
adb logcat | grep "UNHANDLED_REJECTION"

# Save logs to file
adb logcat > app_logs.txt

# Clear logs and start fresh
adb logcat -c && adb logcat
```

### Method 2: Using Android Studio Logcat

1. Open Android Studio
2. Connect your device
3. Open Logcat window (View > Tool Windows > Logcat)
4. Filter by package name: `com.freejobwala.app`
5. Filter by tag: `JOBWALA` or `ReactNativeJS`

### Method 3: Using Chrome DevTools (Remote Debugging)

1. **Build APK with debug mode enabled** (not recommended for production)
2. Shake device to open dev menu
3. Select "Debug JS Remotely"
4. Open Chrome and navigate to `chrome://inspect`
5. Click "inspect" under your device
6. View console logs in Chrome DevTools

## Log Prefixes for Filtering

All logs are prefixed for easy filtering:

- `[JOBWALA_DEBUG]` - Debug messages
- `[JOBWALA_ERROR]` - Error messages
- `[JOBWALA_WARN]` - Warning messages
- `[JOBWALA_INFO]` - Info messages
- `[JOBWALA_API]` - API calls
- `[JOBWALA_NAV]` - Navigation events
- `[GLOBAL_ERROR]` - Global error handler
- `[UNHANDLED_REJECTION]` - Unhandled promise rejections
- `[ERROR_BOUNDARY]` - Error boundary catches
- `[CONSOLE_ERROR]` - Console errors

## Common Issues and Solutions

### Issue: App crashes on startup
**Check logs for:**
```bash
adb logcat | grep -E "FATAL|Exception|ErrorBoundary"
```

### Issue: API calls failing
**Check logs for:**
```bash
adb logcat | grep "JOBWALA_API"
```

### Issue: Navigation errors
**Check logs for:**
```bash
adb logcat | grep "JOBWALA_NAV"
```

### Issue: Unhandled promise rejections
**Check logs for:**
```bash
adb logcat | grep "UNHANDLED_REJECTION"
```

## Using the Debug Logger Utility

Import and use the debug logger in your components:

```javascript
import debugLogger from '../utils/debugLogger';

// Log debug messages
debugLogger.log('Component mounted');

// Log errors
debugLogger.error('Something went wrong', error);

// Log API calls
debugLogger.api('GET', '/api/jobs', null, response);

// Log navigation
debugLogger.navigation('navigate', 'Home', { userId: 123 });

// Log objects
debugLogger.object('User data', userData);

// Log stack trace
debugLogger.stack('Current location');
```

## Testing Error Handling

To test if error logging is working:

1. **Trigger an error in a component:**
```javascript
// Add this temporarily to a component
throw new Error('Test error');
```

2. **Check logs:**
```bash
adb logcat | grep "ERROR_BOUNDARY"
```

3. **Trigger a promise rejection:**
```javascript
// Add this temporarily
Promise.reject(new Error('Test promise rejection'));
```

4. **Check logs:**
```bash
adb logcat | grep "UNHANDLED_REJECTION"
```

## Tips

1. **Clear logs before testing:** `adb logcat -c`
2. **Use filters:** Always filter logs to avoid information overload
3. **Save logs:** Save logs to file for analysis: `adb logcat > logs.txt`
4. **Check timestamps:** Logs include timestamps for debugging timing issues
5. **Use tags:** All logs are tagged for easy filtering

## Additional Resources

- [React Native Debugging](https://reactnative.dev/docs/debugging)
- [ADB Logcat Documentation](https://developer.android.com/studio/command-line/logcat)
- [Expo Debugging](https://docs.expo.dev/workflow/debugging/)
