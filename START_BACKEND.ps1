# PowerShell script to start the backend server
# Run this from the project root directory

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "AI Accessibility Validator - Backend Server" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Change to backend directory
$backendPath = Join-Path $PSScriptRoot "backend"
if (-not (Test-Path $backendPath)) {
    Write-Host "[ERROR] Backend directory not found!" -ForegroundColor Red
    exit 1
}

Set-Location $backendPath

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "[1/4] Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.8+ from https://www.python.org/" -ForegroundColor Yellow
    exit 1
}

# Check if virtual environment exists
$venvPath = Join-Path $backendPath "venv"
$activateScript = Join-Path $venvPath "Scripts\Activate.ps1"

if (-not (Test-Path $activateScript)) {
    Write-Host "[2/4] Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to create virtual environment" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[2/4] Virtual environment found" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "[3/4] Activating virtual environment..." -ForegroundColor Yellow
& $activateScript
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to activate virtual environment" -ForegroundColor Red
    exit 1
}

# Install/upgrade pip
Write-Host "[4/4] Checking dependencies..." -ForegroundColor Yellow
python -m pip install --upgrade pip --quiet

# Install essential dependencies
Write-Host "Installing essential dependencies..." -ForegroundColor Yellow
pip install fastapi uvicorn httpx beautifulsoup4 lxml --quiet

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Starting Backend Server..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Server URL: http://localhost:8000" -ForegroundColor Green
Write-Host "API Docs:   http://localhost:8000/docs" -ForegroundColor Green
Write-Host "Health:     http://localhost:8000/health" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Start the server
python simple_server.py

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Server failed to start" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Make sure port 8000 is not in use" -ForegroundColor Yellow
    Write-Host "2. Check if all dependencies are installed: pip install -r requirements.txt" -ForegroundColor Yellow
    Write-Host "3. Try running: python simple_server.py manually" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
}
