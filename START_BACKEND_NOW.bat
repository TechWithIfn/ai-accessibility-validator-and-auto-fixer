@echo off
REM Quick start script - Double click this to start the backend
REM This script runs the PowerShell auto-start script

echo ================================================
echo AI Accessibility Validator - Quick Start
echo ================================================
echo.

REM Check if PowerShell is available
where powershell >nul 2>&1
if errorlevel 1 (
    echo [ERROR] PowerShell is not available
    echo Please install PowerShell or use start_server.bat instead
    pause
    exit /b 1
)

REM Run the PowerShell script with auto-start enabled
powershell.exe -ExecutionPolicy Bypass -File "%~dp0START_BACKEND_AUTO.ps1" -AutoStart

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to start backend
    echo.
    echo Alternative options:
    echo 1. Navigate to the "backend" folder
    echo 2. Double-click "start_server.bat"
    echo.
    pause
)

