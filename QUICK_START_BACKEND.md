# Quick Start: Backend Server

The backend server needs to be running for the scanner and code comparison features to work.

## Windows - Easiest Method

### Option 1: Use the Batch File (Recommended)

1. **Double-click** `backend\start_server.bat` file
   - OR right-click → "Run as administrator"

2. Wait for the server to start. You should see:
   ```
   INFO:     Uvicorn running on http://0.0.0.0:8000
   INFO:     Application startup complete.
   ```

3. Keep this window open while using the app.

### Option 2: Use PowerShell Script

1. Open PowerShell in the project root
2. Run: `.\START_BACKEND.ps1`
3. Keep the window open

### Option 3: Manual Start

1. Open a terminal/PowerShell
2. Navigate to backend:
   ```powershell
   cd backend
   ```
3. Activate virtual environment:
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```
4. Start server:
   ```powershell
   python main.py
   ```

## Verify Backend is Running

Open your browser and visit:
- **Health Check**: http://localhost:8000/health
- **API Docs**: http://localhost:8000/docs

You should see:
```json
{"status": "healthy", "service": "accessibility-validator"}
```

## Troubleshooting

### Port Already in Use
If port 8000 is already in use:
1. Find and close the process using port 8000:
   ```powershell
   netstat -ano | findstr :8000
   ```
2. Or change the port in `backend/main.py` (last line)

### Missing Dependencies
If you get import errors:
```powershell
cd backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Virtual Environment Not Found
The batch file will create it automatically. Or manually:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Important Notes

- **Keep the terminal window open** while using the app
- The backend runs on `http://localhost:8000` by default
- Frontend connects automatically if backend is running
- If backend is offline, you'll see an error message with these instructions

