# Local Build Guide

This guide explains how to build your Expo React Native app locally without using Expo's online build service (EAS Build).

## 📋 Prerequisites

### For Android Builds (Windows, Mac, Linux)

1. **Java Development Kit (JDK) 17 or higher**
   - Download from: https://adoptium.net/
   - Set `JAVA_HOME` environment variable
   - Add Java to your PATH

2. **Android Studio**
   - Download from: https://developer.android.com/studio
   - Install Android SDK (API level 33 or higher recommended)
   - Set `ANDROID_HOME` environment variable:
     - Windows: `C:\Users\YourUsername\AppData\Local\Android\Sdk`
     - Mac/Linux: `~/Android/Sdk`
   - Add to PATH:
     - `$ANDROID_HOME/platform-tools` (for adb)
     - `$ANDROID_HOME/tools`
     - `$ANDROID_HOME/tools/bin`

3. **Node.js and npm**
   - Already installed if you're running the app

### For iOS Builds (Mac Only)

1. **Xcode** (latest version from App Store)
2. **CocoaPods**
   ```bash
   sudo gem install cocoapods
   ```
3. **Apple Developer Account** (for code signing)

## 🚀 Quick Start

### Android APK (Installable on devices)

**Windows:**
```powershell
.\build-apk.ps1
```

**Mac/Linux:**
```bash
chmod +x build-android.sh
./build-android.sh
```

**Using npm:**
```bash
npm run build:android:apk
```

### Android App Bundle (AAB) - For Google Play Store

**Windows:**
```powershell
.\build-aab.ps1
```

**Mac/Linux:**
```bash
chmod +x build-aab.sh
./build-aab.sh
```

### iOS Build (Mac Only)

```bash
chmod +x build-ios.sh
./build-ios.sh
```

## 📱 Build Scripts

### Available Scripts

| Script | Description | Platform |
|--------|-------------|----------|
| `build-apk.ps1` / `build-android.sh` | Build Android APK | Windows / Unix |
| `build-aab.ps1` / `build-aab.sh` | Build Android App Bundle | Windows / Unix |
| `build-ios.sh` | Build iOS archive | Mac only |

### Script Options

All scripts support these options:

- `--clean`: Clean previous builds before building
- `--skip-prebuild`: Skip Expo prebuild step (use if native code already exists)

**Example:**
```powershell
.\build-apk.ps1 -Clean
```

```bash
./build-android.sh --clean
```

## 🔧 Manual Build Steps

### Android APK

1. **Generate native code** (if not already done):
   ```bash
   npx expo prebuild --platform android
   ```

2. **Navigate to Android directory:**
   ```bash
   cd android
   ```

3. **Build APK:**
   ```bash
   # Windows
   gradlew.bat assembleRelease
   
   # Mac/Linux
   ./gradlew assembleRelease
   ```

4. **Find your APK:**
   - Location: `android/app/build/outputs/apk/release/app-release.apk`
   - Install on device: `adb install app-release.apk`

### Android App Bundle (AAB)

1. **Generate native code:**
   ```bash
   npx expo prebuild --platform android
   ```

2. **Navigate to Android directory:**
   ```bash
   cd android
   ```

3. **Build AAB:**
   ```bash
   # Windows
   gradlew.bat bundleRelease
   
   # Mac/Linux
   ./gradlew bundleRelease
   ```

4. **Find your AAB:**
   - Location: `android/app/build/outputs/bundle/release/app-release.aab`
   - Upload to Google Play Console

### iOS Build

1. **Generate native code:**
   ```bash
   npx expo prebuild --platform ios
   ```

2. **Install CocoaPods dependencies:**
   ```bash
   cd ios
   pod install
   cd ..
   ```

3. **Open in Xcode:**
   ```bash
   open ios/FreeJobWala.xcworkspace
   ```

4. **Configure signing:**
   - Select your project in Xcode
   - Go to "Signing & Capabilities"
   - Select your development team
   - Xcode will automatically manage provisioning

5. **Build:**
   - Product > Archive (or use the build script)
   - Distribute via Organizer window

## 🔐 Code Signing

### Android

For **debug builds**, the default debug keystore is used automatically.

For **production builds**, you need to create your own keystore:

1. **Generate keystore:**
   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Update `android/app/build.gradle`:**
   ```gradle
   signingConfigs {
       release {
           storeFile file('my-release-key.keystore')
           storePassword 'your-password'
           keyAlias 'my-key-alias'
           keyPassword 'your-password'
       }
   }
   buildTypes {
       release {
           signingConfig signingConfigs.release
       }
   }
   ```

### iOS

iOS requires:
- Apple Developer Account ($99/year)
- Valid provisioning profiles
- Code signing certificates

Configure in Xcode:
1. Open `ios/FreeJobWala.xcworkspace`
2. Select project > Target > Signing & Capabilities
3. Select your team
4. Xcode handles certificates automatically

## 📦 Build Outputs

### Android

- **APK**: `android/app/build/outputs/apk/release/app-release.apk`
  - Directly installable on Android devices
  - Use for testing or sideloading

- **AAB**: `android/app/build/outputs/bundle/release/app-release.aab`
  - Required for Google Play Store
  - Smaller file size, optimized by Google

### iOS

- **Archive**: `ios/build/FreeJobWala.xcarchive`
  - Open in Xcode Organizer
  - Export as IPA for distribution

## 🐛 Troubleshooting

### Common Issues

#### "Java not found"
- Install JDK 17+ from https://adoptium.net/
- Set `JAVA_HOME` environment variable
- Add Java to PATH

#### "Android SDK not found"
- Install Android Studio
- Set `ANDROID_HOME` environment variable
- Default locations:
  - Windows: `C:\Users\YourUsername\AppData\Local\Android\Sdk`
  - Mac: `~/Library/Android/sdk`
  - Linux: `~/Android/Sdk`

#### "Gradle build failed"
- Check internet connection (Gradle downloads dependencies)
- Clear Gradle cache: `cd android && ./gradlew clean`
- Check `android/gradle.properties` for configuration issues

#### "iOS build requires Mac"
- iOS builds can only be done on macOS
- Use EAS Build for cloud builds, or use a Mac

#### "Code signing errors (iOS)"
- Ensure you have a valid Apple Developer account
- Configure signing in Xcode
- Check provisioning profiles in Apple Developer portal

#### "Prebuild errors"
- Ensure all dependencies are installed: `npm install`
- Clear Expo cache: `npx expo start --clear`
- Delete `android` and `ios` folders and run prebuild again

### Environment Variables

**Windows (PowerShell):**
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:ANDROID_HOME = "C:\Users\YourUsername\AppData\Local\Android\Sdk"
```

**Windows (Command Prompt):**
```cmd
set JAVA_HOME=C:\Program Files\Java\jdk-17
set ANDROID_HOME=C:\Users\YourUsername\AppData\Local\Android\Sdk
```

**Mac/Linux:**
```bash
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home
export ANDROID_HOME=~/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools
```

Add to `~/.bashrc` or `~/.zshrc` for persistence.

## 📚 Additional Resources

- [Expo Prebuild Documentation](https://docs.expo.dev/workflow/prebuild/)
- [React Native Android Setup](https://reactnative.dev/docs/environment-setup)
- [Android App Signing](https://reactnative.dev/docs/signed-apk-android)
- [iOS Code Signing](https://developer.apple.com/support/code-signing/)

## 🆚 Local Build vs EAS Build

| Feature | Local Build | EAS Build |
|---------|-------------|-----------|
| **Speed** | Depends on your machine | Cloud servers |
| **Cost** | Free | Free tier available |
| **Internet** | Required for dependencies | Required |
| **Platform** | Android: Any OS<br>iOS: Mac only | Any OS |
| **Setup** | Requires SDKs/tools | Minimal setup |
| **Control** | Full control | Limited customization |

## ✅ Next Steps

After building:

1. **Test your APK/AAB:**
   - Install on physical device
   - Test all features
   - Check performance

2. **For Google Play:**
   - Upload AAB to Play Console
   - Complete store listing
   - Submit for review

3. **For App Store:**
   - Export IPA from Xcode
   - Upload via App Store Connect
   - Submit for review

---

**Need help?** Check the troubleshooting section or refer to Expo/React Native documentation.

