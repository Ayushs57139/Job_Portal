# Android SDK Setup Helper Script
# This script helps you set up Android SDK for local builds

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Android SDK Setup Helper" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "This script will help you set up Android SDK for building Android apps locally.`n" -ForegroundColor Yellow

# Check if Android SDK already exists
$sdkFound = $false
$sdkPath = $null

$commonPaths = @(
    "$env:LOCALAPPDATA\Android\Sdk",
    "$env:USERPROFILE\Android\Sdk",
    "C:\Program Files\Android\Sdk",
    "C:\Android\Sdk"
)

Write-Host "Checking for existing Android SDK installations..." -ForegroundColor Cyan
foreach ($path in $commonPaths) {
    if (Test-Path $path) {
        $sdkFound = $true
        $sdkPath = $path
        Write-Host "[OK] Found Android SDK at: $path" -ForegroundColor Green
        break
    }
}

if ($sdkFound) {
    Write-Host "`nAndroid SDK is already installed!" -ForegroundColor Green
    Write-Host "Location: $sdkPath" -ForegroundColor Cyan
    Write-Host "`nTo use it, you can:" -ForegroundColor Yellow
    Write-Host "1. Set ANDROID_HOME environment variable:" -ForegroundColor White
    Write-Host "   [System.Environment]::SetEnvironmentVariable('ANDROID_HOME', '$sdkPath', 'User')" -ForegroundColor Green
    Write-Host "`n2. Or run build script with path:" -ForegroundColor White
    Write-Host "   .\build-apk.ps1 -AndroidSdkPath `"$sdkPath`"" -ForegroundColor Green
    exit 0
}

Write-Host "`n[INFO] Android SDK not found.`n" -ForegroundColor Yellow

Write-Host "To install Android SDK, you have two options:`n" -ForegroundColor Cyan

Write-Host "Option 1: Install Android Studio (Recommended - Full IDE)" -ForegroundColor Green
Write-Host "  1. Download Android Studio from: https://developer.android.com/studio" -ForegroundColor White
Write-Host "  2. Run the installer" -ForegroundColor White
Write-Host "  3. During installation, it will install Android SDK automatically" -ForegroundColor White
Write-Host "  4. Default SDK location: $env:LOCALAPPDATA\Android\Sdk" -ForegroundColor White
Write-Host "  5. After installation, run this script again to verify" -ForegroundColor White

Write-Host "`nOption 2: Install Command Line Tools Only (Lighter)" -ForegroundColor Green
Write-Host "  1. Download SDK Command Line Tools:" -ForegroundColor White
Write-Host "     https://developer.android.com/studio#command-tools" -ForegroundColor Cyan
Write-Host "  2. Extract to a folder (e.g., C:\Android\Sdk)" -ForegroundColor White
Write-Host "  3. Run: .\bin\sdkmanager.bat --install `"platform-tools`" `"platforms;android-33`"" -ForegroundColor White
Write-Host "  4. Set ANDROID_HOME to the SDK folder" -ForegroundColor White

Write-Host "`nAfter installation, you can:" -ForegroundColor Yellow
Write-Host "- Set ANDROID_HOME environment variable permanently" -ForegroundColor White
Write-Host "- Or use -AndroidSdkPath parameter when running build scripts" -ForegroundColor White

Write-Host "`nWould you like to:" -ForegroundColor Cyan
Write-Host "1. Open Android Studio download page in browser" -ForegroundColor White
Write-Host "2. Open SDK Command Line Tools download page" -ForegroundColor White
Write-Host "3. Exit" -ForegroundColor White

$choice = Read-Host "`nEnter choice (1-3)"

switch ($choice) {
    "1" {
        Start-Process "https://developer.android.com/studio"
        Write-Host "`nOpening Android Studio download page..." -ForegroundColor Green
    }
    "2" {
        Start-Process "https://developer.android.com/studio#command-tools"
        Write-Host "`nOpening SDK Command Line Tools download page..." -ForegroundColor Green
    }
    "3" {
        Write-Host "`nExiting..." -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "`nInvalid choice. Exiting..." -ForegroundColor Red
        exit 1
    }
}

Write-Host "`nAfter installing Android SDK, run this script again to verify the installation." -ForegroundColor Cyan

