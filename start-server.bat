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

REM Try different Python commands and start in background
echo Attempting to start Python server...
py --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Using 'py' command...
    start /b py server.py
    goto :server_started
)

python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Using 'python' command...
    start /b python server.py
    goto :server_started
)

python3 --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Using 'python3' command...
    start /b python3 server.py
    goto :server_started
)

echo ERROR: Python not found! Please install Python or ensure it's in your PATH.
echo Tried: py, python, python3
echo.
pause
exit /b 1

:server_started
echo Python server started successfully!

REM Wait 3 seconds then open browser
timeout /t 3 /nobreak >nul
start http://%IP%:8080
