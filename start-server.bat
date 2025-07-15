@echo off
echo Starting Vet Dashboard Server...
echo.

REM Get the actual IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        set IP=%%b
        goto :found
    )
)
:found

echo Server starting on:
echo - Admin Panel: http://localhost:8080
echo - TV Display:  http://localhost:8080/tv.html
echo.
echo For access from other devices (TV, tablet, etc.):
echo - Admin Panel: http://%IP%:8080
echo - TV Display:  http://%IP%:8080/tv.html
echo.
echo Opening admin panel in 3 seconds...
echo Press Ctrl+C to stop the server
echo.

REM Start the server in background
cd /d "%~dp0"
start /b py server.py

REM Wait 3 seconds then open browser
timeout /t 3 /nobreak >nul
start http://%IP%:8080
