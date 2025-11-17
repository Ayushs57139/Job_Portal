# Quick Start: Building Your App Locally

## ✅ Prerequisites Checklist

Before building, make sure you have:

- [x] **Java JDK 17+** - ✅ Already installed (Java 17 will be used automatically)
- [ ] **Android SDK** - ❌ Needs to be installed

## 🚀 Quick Setup

### Step 1: Install Android SDK

**Option A: Install Android Studio (Recommended)**
1. Download: https://developer.android.com/studio
2. Install Android Studio
3. Open Android Studio → **SDK Manager**
4. Install **Android SDK** (API 33+ recommended)
5. SDK will be installed at: `C:\Users\Ayush\AppData\Local\Android\Sdk`

**Option B: Use Command Line Tools Only**
1. Download: https://developer.android.com/studio#command-tools
2. Extract to `C:\Android\Sdk`
3. Run: `.\bin\sdkmanager.bat --install "platform-tools" "platforms;android-33"`

### Step 2: Build Your App

Once Android SDK is installed, simply run:

```powershell
.\build-apk.ps1
```

The script will automatically:
- ✅ Detect Java 17 (compatible with Gradle)
- ✅ Find Android SDK
- ✅ Update configuration files
- ✅ Build your APK

## 📱 Build Commands

### Build APK (for direct installation)
```powershell
.\build-apk.ps1
```

### Build AAB (for Google Play Store)
```powershell
.\build-aab.ps1
```

### Build with Clean (removes previous builds)
```powershell
.\build-apk.ps1 -Clean
```

### Specify Custom SDK Path
If your Android SDK is in a non-standard location:
```powershell
.\build-apk.ps1 -AndroidSdkPath "C:\path\to\android\sdk"
```

## 📍 Output Locations

After successful build:
- **APK**: `android\app\build\outputs\apk\release\app-release.apk`
- **AAB**: `android\app\build\outputs\bundle\release\app-release.aab`

## 🔧 Troubleshooting

### "Android SDK not found"
- Install Android Studio or SDK Command Line Tools
- Or specify path: `.\build-apk.ps1 -AndroidSdkPath "C:\path\to\sdk"`

### "Java version error"
- Script automatically uses Java 17 (compatible with Gradle)
- No action needed

### "Gradle build failed"
- Check internet connection (Gradle downloads dependencies)
- Run: `.\build-apk.ps1 -Clean` to clean previous builds
- Check `android\local.properties` has correct SDK path

## 📚 More Information

See `LOCAL-BUILD-GUIDE.md` for detailed documentation.

