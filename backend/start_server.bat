@echo off
echo ================================================
echo Starting AI Accessibility Validator Backend
echo ================================================
echo.

cd /d "%~dp0"

REM Check if virtual environment exists
if exist "venv\Scripts\activate.bat" (
    echo [1/3] Activating virtual environment...
    call venv\Scripts\activate.bat
) else (
    echo [1/3] Virtual environment not found. Creating one...
    python -m venv venv
    call venv\Scripts\activate.bat
    echo [2/3] Installing dependencies...
    python -m pip install --upgrade pip
    pip install fastapi uvicorn beautifulsoup4 httpx lxml
    echo [3/3] Dependencies installed!
)

echo.
echo ================================================
echo Starting FastAPI server...
echo ================================================
echo Server: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo Health: http://localhost:8000/health
echo.
echo Press Ctrl+C to stop the server
echo ================================================
echo.

REM Try simple_server.py first (more reliable)
if exist "simple_server.py" (
    echo Using simple server (more reliable)...
    python simple_server.py
) else (
    echo Using main server...
    python main.py
)

pause
