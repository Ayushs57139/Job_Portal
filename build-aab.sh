#!/bin/bash
# Build Android App Bundle (AAB) Script (Local Build) - Linux/Mac
# Prerequisites: Java JDK 17+ and Android SDK must be installed
# AAB files are required for Google Play Store uploads

set -e

CLEAN=false
SKIP_PREBUILD=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --clean)
            CLEAN=true
            shift
            ;;
        --skip-prebuild)
            SKIP_PREBUILD=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--clean] [--skip-prebuild]"
            exit 1
            ;;
    esac
done

echo ""
echo "========================================"
echo "  Building Android App Bundle (AAB)"
echo "========================================"
echo ""

# Check if Java is installed
echo "Checking prerequisites..."
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1)
    echo "✓ Java found: $JAVA_VERSION"
else
    echo "✗ Java/JDK not found. Please install JDK 17+ and set JAVA_HOME"
    echo "  Download: https://adoptium.net/"
    exit 1
fi

# Check if Android SDK is configured
if [ -n "$ANDROID_HOME" ]; then
    echo "✓ Android SDK found: $ANDROID_HOME"
elif [ -n "$ANDROID_SDK_ROOT" ]; then
    echo "✓ Android SDK found: $ANDROID_SDK_ROOT"
    export ANDROID_HOME=$ANDROID_SDK_ROOT
else
    echo "⚠ Android SDK not found. Please set ANDROID_HOME environment variable"
    echo "  Default location: ~/Android/Sdk"
    echo "  Install Android Studio: https://developer.android.com/studio"
fi

# Run prebuild if needed
if [ "$SKIP_PREBUILD" = false ]; then
    if [ ! -d "android/app/src/main" ]; then
        echo ""
        echo "Running Expo prebuild to generate native code..."
        npx expo prebuild --platform android
        if [ $? -ne 0 ]; then
            echo "✗ Prebuild failed!"
            exit 1
        fi
    else
        echo "✓ Native Android project already exists"
    fi
fi

# Navigate to android directory
cd android

if [ "$CLEAN" = true ]; then
    echo ""
    echo "Cleaning previous build..."
    ./gradlew clean || echo "⚠ Clean failed, continuing anyway..."
fi

echo ""
echo "Building Release App Bundle..."
echo "This may take several minutes..."
./gradlew bundleRelease

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "  ✓ AAB built successfully!"
    echo "========================================"
    echo ""
    
    AAB_PATH="app/build/outputs/bundle/release/app-release.aab"
    if [ -f "$AAB_PATH" ]; then
        FULL_PATH=$(realpath "$AAB_PATH")
        FILE_SIZE=$(du -h "$AAB_PATH" | cut -f1)
        echo "AAB Location: $FULL_PATH"
        echo "AAB Size: $FILE_SIZE"
        echo ""
        echo "This AAB file is ready for Google Play Store upload!"
        echo "Upload via: https://play.google.com/console"
    fi
else
    echo ""
    echo "✗ Build failed. Check the error messages above."
    exit 1
fi

cd ..

