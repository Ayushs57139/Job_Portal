# Build Android APK Script
# Prerequisites: Java JDK and Android SDK must be installed

Write-Host "Building Android APK..." -ForegroundColor Green

# Check if Java is installed
try {
    $javaVersion = java -version 2>&1 | Select-String "version"
    Write-Host "✓ Java found: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Java/JDK not found. Please install JDK 17+ and set JAVA_HOME" -ForegroundColor Red
    exit 1
}

# Check if Android SDK is configured
if ($env:ANDROID_HOME) {
    Write-Host "✓ Android SDK found: $env:ANDROID_HOME" -ForegroundColor Green
} else {
    Write-Host "⚠ Android SDK not found. Please set ANDROID_HOME environment variable" -ForegroundColor Yellow
    Write-Host "  Default location: C:\Users\$env:USERNAME\AppData\Local\Android\Sdk" -ForegroundColor Yellow
}

# Navigate to android directory
Set-Location android

Write-Host "`nCleaning previous build..." -ForegroundColor Cyan
.\gradlew.bat clean

Write-Host "`nBuilding Release APK..." -ForegroundColor Cyan
.\gradlew.bat assembleRelease

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ APK built successfully!" -ForegroundColor Green
    $apkPath = "app\build\outputs\apk\release\app-release.apk"
    if (Test-Path $apkPath) {
        $fullPath = (Resolve-Path $apkPath).Path
        Write-Host "`nAPK Location: $fullPath" -ForegroundColor Green
        Write-Host "`nYou can now install this APK on Android devices!" -ForegroundColor Cyan
    }
} else {
    Write-Host "`n✗ Build failed. Check the error messages above." -ForegroundColor Red
}

Set-Location ..

