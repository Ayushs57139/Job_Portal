# Build Android App Bundle (AAB) Script (Local Build)
# Prerequisites: Java JDK 17+ and Android SDK must be installed
# AAB files are required for Google Play Store uploads

param(
    [switch]$Clean = $false,
    [switch]$SkipPrebuild = $false,
    [string]$AndroidSdkPath = ""
)

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Building Android App Bundle (AAB)" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if Java is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
$javaCheck = $null
try {
    $javaOutput = & java -version 2>&1
    if ($LASTEXITCODE -eq 0 -or $javaOutput) {
        $javaVersion = $javaOutput | Select-String "version" | Select-Object -First 1
        if ($javaVersion) {
            Write-Host "[OK] Java found: $javaVersion" -ForegroundColor Green
            $javaCheck = $true
        }
    }
} catch {
    # Java command might not be in PATH, but that's okay if JAVA_HOME is set
}

if (-not $javaCheck) {
    # Try checking if JAVA_HOME is set and java.exe exists there
    if ($env:JAVA_HOME -and (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
        Write-Host "[OK] Java found via JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Green
        $javaCheck = $true
    } elseif (Get-Command java -ErrorAction SilentlyContinue) {
        Write-Host "[OK] Java found in PATH" -ForegroundColor Green
        $javaCheck = $true
    }
}

if (-not $javaCheck) {
    Write-Host "[ERROR] Java/JDK not found. Please install JDK 17+ and set JAVA_HOME" -ForegroundColor Red
    Write-Host "  Download: https://adoptium.net/" -ForegroundColor Yellow
    Write-Host "  Current JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Yellow
    exit 1
}

# Check if Android SDK is configured
$androidSdkPath = $null

# First check if manually specified via parameter
if ($AndroidSdkPath -and (Test-Path $AndroidSdkPath)) {
    $androidSdkPath = $AndroidSdkPath
    Write-Host "[OK] Android SDK found (manual path): $androidSdkPath" -ForegroundColor Green
    $env:ANDROID_HOME = $androidSdkPath
} elseif ($env:ANDROID_HOME -and (Test-Path $env:ANDROID_HOME)) {
    $androidSdkPath = $env:ANDROID_HOME
    Write-Host "[OK] Android SDK found: $androidSdkPath" -ForegroundColor Green
} elseif ($env:ANDROID_SDK_ROOT -and (Test-Path $env:ANDROID_SDK_ROOT)) {
    $androidSdkPath = $env:ANDROID_SDK_ROOT
    $env:ANDROID_HOME = $androidSdkPath
    Write-Host "[OK] Android SDK found: $androidSdkPath" -ForegroundColor Green
} else {
    # Try to find Android SDK in common locations
    $commonPaths = @(
        "$env:LOCALAPPDATA\Android\Sdk",
        "$env:USERPROFILE\Android\Sdk",
        "C:\Program Files\Android\Sdk",
        "C:\Android\Sdk"
    )
    
    foreach ($path in $commonPaths) {
        if (Test-Path $path) {
            $androidSdkPath = $path
            Write-Host "[OK] Android SDK found at: $androidSdkPath" -ForegroundColor Green
            $env:ANDROID_HOME = $androidSdkPath
            break
        }
    }
    
    if (-not $androidSdkPath) {
        Write-Host "[ERROR] Android SDK not found!" -ForegroundColor Red
        Write-Host "`nTo fix this, you have two options:" -ForegroundColor Yellow
        Write-Host "`nOption 1: Install Android Studio (Recommended)" -ForegroundColor Cyan
        Write-Host "  1. Download: https://developer.android.com/studio" -ForegroundColor White
        Write-Host "  2. Install Android Studio" -ForegroundColor White
        Write-Host "  3. Open Android Studio > SDK Manager" -ForegroundColor White
        Write-Host "  4. Install Android SDK (API 33+ recommended)" -ForegroundColor White
        Write-Host "  5. Run this script again" -ForegroundColor White
        Write-Host "`nOption 2: Specify SDK path manually" -ForegroundColor Cyan
        Write-Host "  If you already have Android SDK installed, run:" -ForegroundColor White
        Write-Host "  .\build-aab.ps1 -AndroidSdkPath `"C:\path\to\your\android\sdk`"" -ForegroundColor Green
        Write-Host "`nCommon SDK locations:" -ForegroundColor Yellow
        Write-Host "  - $env:LOCALAPPDATA\Android\Sdk" -ForegroundColor White
        Write-Host "  - $env:USERPROFILE\Android\Sdk" -ForegroundColor White
        Write-Host "  - C:\Program Files\Android\Sdk" -ForegroundColor White
        exit 1
    }
}

# Update local.properties with SDK path
$localPropertiesPath = "android\local.properties"
# Escape backslashes for Java properties file format
$escapedPath = $androidSdkPath -replace '\\', '\\'
$sdkDirLine = "sdk.dir=$escapedPath"
if (Test-Path $localPropertiesPath) {
    $content = Get-Content $localPropertiesPath -Raw
    if ($content -match "sdk\.dir=.*") {
        $content = $content -replace "sdk\.dir=.*", $sdkDirLine
        Set-Content $localPropertiesPath $content -NoNewline
        Write-Host "[INFO] Updated local.properties with SDK path" -ForegroundColor Cyan
    } else {
        Add-Content $localPropertiesPath "`n$sdkDirLine"
        Write-Host "[INFO] Added SDK path to local.properties" -ForegroundColor Cyan
    }
} else {
    Set-Content $localPropertiesPath $sdkDirLine
    Write-Host "[INFO] Created local.properties with SDK path" -ForegroundColor Cyan
}

# Run prebuild if needed
if (-not $SkipPrebuild) {
    if (-not (Test-Path "android\app\src\main")) {
        Write-Host "`nRunning Expo prebuild to generate native code..." -ForegroundColor Cyan
        npx expo prebuild --platform android
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Prebuild failed!" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "[OK] Native Android project already exists" -ForegroundColor Green
    }
}

# Check for Java 17 (required for Gradle compatibility)
$java17Path = "C:\Users\Ayush\Java\jdk-17"
if (Test-Path "$java17Path\bin\java.exe") {
    Write-Host "[INFO] Using Java 17 for Gradle build (Java 25 not supported by Gradle)" -ForegroundColor Cyan
    $originalJavaHome = $env:JAVA_HOME
    $env:JAVA_HOME = $java17Path
    $env:PATH = "$java17Path\bin;$env:PATH"
}

# Navigate to android directory
Push-Location android

try {
    if ($Clean) {
        Write-Host "`nCleaning previous build..." -ForegroundColor Cyan
        .\gradlew.bat clean
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[WARNING] Clean failed, continuing anyway..." -ForegroundColor Yellow
        }
    }

    Write-Host "`nBuilding Release App Bundle..." -ForegroundColor Cyan
    Write-Host "This may take several minutes..." -ForegroundColor Yellow
    .\gradlew.bat bundleRelease

    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n========================================" -ForegroundColor Green
        Write-Host "  [SUCCESS] AAB built successfully!" -ForegroundColor Green
        Write-Host "========================================`n" -ForegroundColor Green
        
        $aabPath = "app\build\outputs\bundle\release\app-release.aab"
        if (Test-Path $aabPath) {
            $fullPath = (Resolve-Path $aabPath).Path
            $fileSize = (Get-Item $aabPath).Length / 1MB
            Write-Host "AAB Location: $fullPath" -ForegroundColor Green
            Write-Host "AAB Size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Green
            Write-Host "`nThis AAB file is ready for Google Play Store upload!" -ForegroundColor Cyan
            Write-Host "Upload via: https://play.google.com/console" -ForegroundColor Yellow
        }
    } else {
        Write-Host "`n[ERROR] Build failed. Check the error messages above." -ForegroundColor Red
        exit 1
    }
} finally {
    Pop-Location
    # Restore original JAVA_HOME if we changed it
    if ($originalJavaHome) {
        $env:JAVA_HOME = $originalJavaHome
    }
}

