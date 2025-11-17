#!/bin/bash
# Build iOS App Script (Local Build) - Mac Only
# Prerequisites: Xcode, CocoaPods, and Apple Developer account

set -e

CLEAN=false
SKIP_PREBUILD=false
SCHEME="FreeJobWala"
WORKSPACE="FreeJobWala.xcworkspace"

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

# Check if running on Mac
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "✗ iOS builds can only be done on macOS"
    echo "  Please use a Mac or build via EAS Build"
    exit 1
fi

echo ""
echo "========================================"
echo "  Building iOS App Locally"
echo "========================================"
echo ""

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v xcodebuild &> /dev/null; then
    echo "✗ Xcode not found. Please install Xcode from the App Store"
    exit 1
fi
echo "✓ Xcode found"

if ! command -v pod &> /dev/null; then
    echo "✗ CocoaPods not found. Installing..."
    sudo gem install cocoapods
fi
echo "✓ CocoaPods found"

# Run prebuild if needed
if [ "$SKIP_PREBUILD" = false ]; then
    if [ ! -d "ios/Pods" ]; then
        echo ""
        echo "Running Expo prebuild to generate native code..."
        npx expo prebuild --platform ios
        if [ $? -ne 0 ]; then
            echo "✗ Prebuild failed!"
            exit 1
        fi
        
        echo ""
        echo "Installing CocoaPods dependencies..."
        cd ios
        pod install
        cd ..
    else
        echo "✓ Native iOS project already exists"
    fi
fi

# Navigate to ios directory
cd ios

if [ "$CLEAN" = true ]; then
    echo ""
    echo "Cleaning previous build..."
    xcodebuild clean -workspace "$WORKSPACE" -scheme "$SCHEME" || echo "⚠ Clean failed, continuing anyway..."
fi

echo ""
echo "Building iOS app..."
echo "This may take several minutes..."
echo ""
echo "Note: You may need to:"
echo "  1. Open ios/$WORKSPACE in Xcode"
echo "  2. Select your development team in Signing & Capabilities"
echo "  3. Configure code signing certificates"
echo ""

# Build archive
xcodebuild archive \
    -workspace "$WORKSPACE" \
    -scheme "$SCHEME" \
    -configuration Release \
    -archivePath build/FreeJobWala.xcarchive \
    -allowProvisioningUpdates

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "  ✓ iOS Archive built successfully!"
    echo "========================================"
    echo ""
    
    ARCHIVE_PATH="build/FreeJobWala.xcarchive"
    if [ -d "$ARCHIVE_PATH" ]; then
        FULL_PATH=$(realpath "$ARCHIVE_PATH")
        echo "Archive Location: $FULL_PATH"
        echo ""
        echo "Next steps:"
        echo "  1. Open Xcode"
        echo "  2. Go to Window > Organizer"
        echo "  3. Select your archive"
        echo "  4. Click 'Distribute App' to create IPA for App Store or Ad Hoc distribution"
    fi
else
    echo ""
    echo "✗ Build failed. Check the error messages above."
    echo ""
    echo "Common issues:"
    echo "  - Code signing: Configure in Xcode > Signing & Capabilities"
    echo "  - Provisioning profile: Ensure you have valid certificates"
    exit 1
fi

cd ..

