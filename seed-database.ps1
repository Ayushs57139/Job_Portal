# Master Data Seeding Script for PowerShell
# This script seeds all master data from the job post form into your database

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   Master Data Seeding Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$serverUrl = "http://localhost:5000"
$endpoint = "/api/admin/seed-master-data"

# Ask for admin token
Write-Host "Please enter your admin token:" -ForegroundColor Yellow
Write-Host "(You can find this in browser DevTools > Application > Local Storage > 'token')" -ForegroundColor Gray
$token = Read-Host "Admin Token"

if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "Error: Token is required!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Seeding master data..." -ForegroundColor Green

try {
    # Make the API call
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri "$serverUrl$endpoint" -Method Post -Headers $headers
    
    # Display results
    Write-Host ""
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host "Master data seeded successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Seeded Items:" -ForegroundColor Cyan
    Write-Host "  - Job Titles: $($response.data.jobTitles)" -ForegroundColor White
    Write-Host "  - Key Skills: $($response.data.keySkills)" -ForegroundColor White
    Write-Host "  - Industries: $($response.data.industries)" -ForegroundColor White
    Write-Host "  - Departments: $($response.data.departments)" -ForegroundColor White
    Write-Host "  - Courses: $($response.data.courses)" -ForegroundColor White
    Write-Host "  - Specializations: $($response.data.specializations)" -ForegroundColor White
    Write-Host "  - Education Fields: $($response.data.educationFields)" -ForegroundColor White
    Write-Host "  - Locations: $($response.data.locations)" -ForegroundColor White
    Write-Host ""
    Write-Host "  TOTAL: $($response.total) items" -ForegroundColor Yellow
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Go to your admin panel" -ForegroundColor White
    Write-Host "2. Navigate to Master Data section" -ForegroundColor White
    Write-Host "3. Check Job Titles, Key Skills, etc." -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ Error!" -ForegroundColor Red
    Write-Host "=====================================" -ForegroundColor Red
    Write-Host "Failed to seed master data" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error details:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor White
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "1. Make sure server is running (cd server && npm start)" -ForegroundColor White
    Write-Host "2. Check if token is correct" -ForegroundColor White
    Write-Host "3. Make sure you have admin permissions" -ForegroundColor White
    Write-Host "=====================================" -ForegroundColor Red
    Write-Host ""
    exit 1
}

