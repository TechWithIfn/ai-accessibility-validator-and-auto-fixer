# Auto-start backend server script
# This script checks if the backend is running and starts it if needed

param(
    [switch]$AutoStart = $false
)

$ErrorActionPreference = "Continue"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "AI Accessibility Validator - Backend Checker" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend is already running
Write-Host "Checking if backend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 2 -UseBasicParsing
    Write-Host "✅ Backend is ALREADY RUNNING!" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Server: http://localhost:8000" -ForegroundColor Cyan
    Write-Host "📚 API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
    Write-Host "💚 Health: http://localhost:8000/health" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "You can now use the scanner!" -ForegroundColor Green
    exit 0
} catch {
    Write-Host "❌ Backend is NOT running" -ForegroundColor Red
    Write-Host ""
}

# Backend is not running, let's start it
$backendPath = Join-Path $PSScriptRoot "backend"
if (-not (Test-Path $backendPath)) {
    Write-Host "[ERROR] Backend directory not found at: $backendPath" -ForegroundColor Red
    Write-Host "Please make sure you're running this script from the project root." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

if (-not $AutoStart) {
    Write-Host "Would you like to start the backend server now? (Y/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne 'Y' -and $response -ne 'y') {
        Write-Host ""
        Write-Host "To start manually:" -ForegroundColor Yellow
        Write-Host "1. Navigate to the 'backend' folder" -ForegroundColor Yellow
        Write-Host "2. Double-click 'start_server.bat'" -ForegroundColor Yellow
        Write-Host "   OR run: python simple_server.py" -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 0
    }
}

Write-Host ""
Write-Host "Starting backend server..." -ForegroundColor Cyan
Write-Host ""

# Change to backend directory
Set-Location $backendPath

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "[1/5] ✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.8+ from https://www.python.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if virtual environment exists
$venvPath = Join-Path $backendPath "venv"
$activateScript = Join-Path $venvPath "Scripts\Activate.ps1"

if (-not (Test-Path $activateScript)) {
    Write-Host "[2/5] ⚠️  Virtual environment not found, creating..." -ForegroundColor Yellow
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to create virtual environment" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "       ✅ Virtual environment created" -ForegroundColor Green
} else {
    Write-Host "[2/5] ✅ Virtual environment found" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "[3/5] Activating virtual environment..." -ForegroundColor Yellow
try {
    & $activateScript
    Write-Host "       ✅ Virtual environment activated" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Failed to activate virtual environment" -ForegroundColor Red
    Write-Host "Trying alternative activation method..." -ForegroundColor Yellow
    & "$venvPath\Scripts\activate.bat"
}

# Install/upgrade pip
Write-Host "[4/5] Checking dependencies..." -ForegroundColor Yellow
python -m pip install --upgrade pip --quiet
Write-Host "       ✅ Pip updated" -ForegroundColor Green

# Install essential dependencies
Write-Host "[5/5] Installing essential dependencies..." -ForegroundColor Yellow
pip install fastapi uvicorn httpx beautifulsoup4 lxml --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "       ✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "       ⚠️  Some dependencies may have issues, but continuing..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🚀 Starting Backend Server..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 Server URL: http://localhost:8000" -ForegroundColor Green
Write-Host "📚 API Docs:   http://localhost:8000/docs" -ForegroundColor Green
Write-Host "💚 Health:     http://localhost:8000/health" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if port 8000 is in use
try {
    $portCheck = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
    if ($portCheck) {
        Write-Host "⚠️  WARNING: Port 8000 is already in use!" -ForegroundColor Yellow
        Write-Host "You may need to stop the existing process first." -ForegroundColor Yellow
        Write-Host ""
    }
} catch {
    # Port check failed, but that's okay - continue anyway
}

# Start the server
try {
    python simple_server.py
} catch {
    Write-Host ""
    Write-Host "[ERROR] Server failed to start" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Make sure port 8000 is not in use" -ForegroundColor Yellow
    Write-Host "2. Check if all dependencies are installed" -ForegroundColor Yellow
    Write-Host "3. Try running: python simple_server.py manually" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

