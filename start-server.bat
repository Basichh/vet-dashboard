@echo off
echo Starting Vet Dashboard API Server...
echo.
echo Your computer's IP address:
ipconfig | findstr "IPv4"
echo.
echo Dashboard URLs:
echo - Admin: http://localhost:8080
echo - Display: http://localhost:8080#display  
echo - Kiosk: http://localhost:8080/kiosk.html
echo - TV Compatible: http://localhost:8080/tv.html
echo.
echo For TV access, use your computer's IP address instead of 'localhost'
echo Example: http://192.168.1.111:8080/tv.html
echo.
echo NOTE: First-time users - your localStorage data will be
echo automatically migrated to the server on first admin page load!
echo.
echo API Endpoints:
echo - GET  /api/visitors - Get all visitors
echo - POST /api/visitors - Update visitors
echo.
echo Press Ctrl+C to stop the server
echo.

cd /d "%~dp0"
py server.py
