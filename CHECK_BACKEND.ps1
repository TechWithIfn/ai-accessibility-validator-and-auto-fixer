# Quick script to check if backend is running
Write-Host "Checking backend status..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 2
    Write-Host "✅ Backend is RUNNING!" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now use the scanner!" -ForegroundColor Green
    Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Backend is NOT running" -ForegroundColor Red
    Write-Host ""
    Write-Host "To start the backend:" -ForegroundColor Yellow
    Write-Host "1. Navigate to the 'backend' folder" -ForegroundColor Yellow
    Write-Host "2. Double-click 'start_server.bat'" -ForegroundColor Yellow
    Write-Host "   OR run: python simple_server.py" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Then verify at: http://localhost:8000/health" -ForegroundColor Cyan
}

