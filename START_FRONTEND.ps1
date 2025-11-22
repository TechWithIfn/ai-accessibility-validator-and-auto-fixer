# PowerShell script to start the frontend Next.js server
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Starting AI Accessibility Validator Frontend" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "[1/2] Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "[1/2] Dependencies installed!" -ForegroundColor Green
} else {
    Write-Host "[1/2] Dependencies already installed" -ForegroundColor Green
}

# Clear Next.js cache
Write-Host "[2/2] Clearing Next.js cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "✅ Cleared .next directory" -ForegroundColor Green
}
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache"
    Write-Host "✅ Cleared node_modules cache" -ForegroundColor Green
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Starting Next.js development server..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Start the development server
npm run dev

