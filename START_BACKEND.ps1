# PowerShell script to start the backend server
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Starting AI Accessibility Validator Backend" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
Set-Location -Path "$PSScriptRoot\backend"

# Check if virtual environment exists
if (Test-Path "venv\Scripts\Activate.ps1") {
    Write-Host "[1/3] Activating virtual environment..." -ForegroundColor Green
    & "venv\Scripts\Activate.ps1"
} else {
    Write-Host "[1/3] Virtual environment not found. Creating one..." -ForegroundColor Yellow
    python -m venv venv
    & "venv\Scripts\Activate.ps1"
    Write-Host "[2/3] Installing dependencies..." -ForegroundColor Green
    python -m pip install --upgrade pip
    pip install -r requirements.txt
    Write-Host "[3/3] Dependencies installed!" -ForegroundColor Green
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Starting FastAPI server..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Server: http://localhost:8000" -ForegroundColor Green
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "Health: http://localhost:8000/health" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Start the server
if (Test-Path "simple_server.py") {
    Write-Host "Using simple server (more reliable)..." -ForegroundColor Green
    python simple_server.py
} else {
    Write-Host "Using main server..." -ForegroundColor Green
    python main.py
}

