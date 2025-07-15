@echo off
echo ========================================
echo   Vet Dashboard Update Script
echo ========================================
echo.

REM Check if PowerShell is available
powershell -Command "Get-Host" >nul 2>&1
if errorlevel 1 (
    echo PowerShell is not available. Please run update.ps1 directly.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo Running PowerShell update script...
echo.

REM Run the PowerShell script
powershell -ExecutionPolicy Bypass -File "%~dp0update.ps1"

echo.
echo Press any key to exit...
pause >nul
