# Quick Fix: Backend Connection Problem

## Problem
❌ Cannot connect to backend at http://localhost:8000

## Solution (Choose One)

### Option 1: Quick Start (Easiest) ⚡
**Double-click this file from the project root:**
- `START_BACKEND_NOW.bat`

This will automatically check if the backend is running and start it if needed.

### Option 2: PowerShell Auto-Start
**Run from the project root:**
```powershell
.\START_BACKEND_AUTO.ps1
```
Or with auto-start enabled:
```powershell
.\START_BACKEND_AUTO.ps1 -AutoStart
```

### Option 3: Manual Start from Backend Folder
1. Navigate to the `backend` folder
2. Double-click `start_server.bat`

### Option 4: Command Line
1. Open terminal in the `backend` folder
2. Run:
```bash
python simple_server.py
```

## Verify It's Running

After starting, check:
- **Health Check**: http://localhost:8000/health
- **API Docs**: http://localhost:8000/docs

You should see:
```json
{"status": "healthy", "service": "accessibility-validator"}
```

## Troubleshooting

### Port Already in Use
If port 8000 is already in use:
```powershell
# Find what's using port 8000
netstat -ano | findstr ":8000"

# Kill the process (replace PID with the number from above)
taskkill /PID <PID> /F
```

### Python Not Found
1. Install Python 3.8+ from https://www.python.org/
2. Make sure Python is added to PATH during installation
3. Restart your terminal/command prompt

### Virtual Environment Issues
If virtual environment fails:
1. Delete the `backend/venv` folder
2. Run the startup script again (it will recreate it)

## Need More Help?

Check the main documentation:
- `README.md` - Full setup guide
- `BACKEND_CONNECTION_FIXED.md` - Detailed backend setup
- `START_BACKEND.md` - Backend startup guide

