# Vet Dashboard Server Startup Script
Write-Host "🏥 Starting Vet Dashboard Server..." -ForegroundColor Green
Write-Host ""

# Get IP address
$ip = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi" | Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*" -or $_.IPAddress -like "172.*"}).IPAddress

if (-not $ip) {
    $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -ne "127.0.0.1"}).IPAddress | Select-Object -First 1
}

Write-Host "🌐 Your computer's IP address: $ip" -ForegroundColor Yellow
Write-Host ""
Write-Host "📱 Dashboard URLs:" -ForegroundColor Cyan
Write-Host "   Admin (local):     http://localhost:8080"
Write-Host "   Display (local):   http://localhost:8080#display"
Write-Host "   TV Kiosk (local):  http://localhost:8080/kiosk.html"
Write-Host ""
Write-Host "📺 For Smart TV access:" -ForegroundColor Magenta
Write-Host "   Admin:    http://$ip:8080"
Write-Host "   Display:  http://$ip:8080#display"
Write-Host "   Kiosk:    http://$ip:8080/kiosk.html"
Write-Host ""
Write-Host "💡 Recommended for TV: Use the Kiosk URL for best experience"
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Red
Write-Host ""

# Change to script directory
Set-Location $PSScriptRoot

# Start Python HTTP server
try {
    python -m http.server 8080
} catch {
    Write-Host "❌ Error: Python not found. Please install Python or use the batch file." -ForegroundColor Red
    Read-Host "Press Enter to exit"
}
