@echo off
echo ================================================
echo AI Accessibility Validator - Backend Server
echo ================================================
echo.

cd /d "%~dp0"

REM Check if backend is already running
echo Checking if backend is already running...
curl -s http://localhost:8000/health >nul 2>&1
if not errorlevel 1 (
    echo [INFO] Backend appears to be already running at http://localhost:8000/health
    echo You may want to stop the existing instance first.
    echo.
)

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

echo [1/5] Python found
python --version

REM Check if virtual environment exists, create if not
if not exist "venv\Scripts\activate.bat" (
    echo [2/5] Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment
        pause
        exit /b 1
    )
    echo        Virtual environment created successfully
) else (
    echo [2/5] Virtual environment found
)

REM Activate virtual environment
echo [3/5] Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo [ERROR] Failed to activate virtual environment
    pause
    exit /b 1
)

REM Install/upgrade pip
echo [4/5] Upgrading pip...
python -m pip install --upgrade pip --quiet
if errorlevel 1 (
    echo [WARNING] Failed to upgrade pip, continuing anyway...
)

REM Install essential dependencies
echo [5/5] Installing essential dependencies...
pip install fastapi uvicorn httpx beautifulsoup4 lxml --quiet
if errorlevel 1 (
    echo [WARNING] Some dependencies may not have installed correctly
    echo Trying again without quiet mode...
    pip install fastapi uvicorn httpx beautifulsoup4 lxml
)

echo.
echo ================================================
echo Starting Backend Server...
echo ================================================
echo.
echo Server URL: http://localhost:8000
echo API Docs:   http://localhost:8000/docs
echo Health:     http://localhost:8000/health
echo.
echo Press Ctrl+C to stop the server
echo ================================================
echo.

REM Check if port is in use
netstat -ano | findstr ":8000" >nul 2>&1
if not errorlevel 1 (
    echo [WARNING] Port 8000 appears to be in use
    echo You may need to stop the existing process first
    echo.
)

REM Start the server using simple_server.py (most reliable)
python simple_server.py

if errorlevel 1 (
    echo.
    echo [ERROR] Server failed to start
    echo.
    echo Troubleshooting:
    echo 1. Make sure port 8000 is not in use
    echo    Check: netstat -ano ^| findstr ":8000"
    echo 2. Check if all dependencies are installed
    echo 3. Try running: python simple_server.py manually
    echo 4. Check Python version: python --version (need 3.8+)
    echo.
    pause
)

