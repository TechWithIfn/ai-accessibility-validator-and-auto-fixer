# 🚀 Complete Project Setup Guide

This guide will help you set up and run the AI Accessibility Validator project successfully.

## ✅ Current Status

- ✅ **Backend Server**: Running at `http://localhost:8000`
- ✅ **Frontend Dependencies**: Installed
- ✅ **Backend Dependencies**: Installed

## 📋 Prerequisites

Before starting, ensure you have:
- **Node.js** 18+ installed ([Download](https://nodejs.org/))
- **Python** 3.8+ installed ([Download](https://www.python.org/downloads/))
- **Git** (optional, for version control)

## 🔧 Step-by-Step Setup

### Step 1: Start the Backend Server

The backend server must be running before using the frontend.

#### Option A: Using PowerShell Script (Recommended for Windows)

```powershell
# From project root
.\START_BACKEND.ps1
```

#### Option B: Manual Start

```powershell
# Navigate to backend directory
cd backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start the server
python simple_server.py
```

#### Option C: Using Batch File

```cmd
cd backend
start_server.bat
```

**Expected Output:**
```
🚀 Starting AI Accessibility Validator Backend
============================================================
📍 Server: http://localhost:8000
📚 API Docs: http://localhost:8000/docs
💚 Health: http://localhost:8000/health
============================================================
```

**Verify Backend is Running:**
- Open browser: http://localhost:8000/health
- Should see: `{"status":"healthy","service":"accessibility-validator"}`

### Step 2: Start the Frontend Server

Open a **new terminal/PowerShell window** (keep backend running):

```powershell
# From project root
npm run dev
```

**Expected Output:**
```
▲ Next.js 14.2.5
- Local:        http://localhost:3000
- Ready in 2.3s
```

**Access the Application:**
- Open browser: http://localhost:3000

### Step 3: Verify Everything Works

1. **Check Backend Status:**
   - Visit http://localhost:8000/health
   - Should return: `{"status":"healthy","service":"accessibility-validator"}`

2. **Check Frontend:**
   - Visit http://localhost:3000
   - You should see the dashboard
   - Look for "Backend Online" indicator in the top right

3. **Test Scanning:**
   - Navigate to "Scanner" page
   - Enter a URL (e.g., `https://example.com`)
   - Click "Scan Website"
   - Should see scan results

## 🐛 Troubleshooting

### Problem: "Failed to scan code. No response from server"

**Solution:**
1. Check if backend is running:
   ```powershell
   # Check if port 8000 is in use
   netstat -ano | Select-String ":8000"
   ```

2. If not running, start the backend:
   ```powershell
   .\START_BACKEND.ps1
   ```

3. Wait for "Application startup complete" message

4. Refresh the frontend page

### Problem: Frontend won't start

**Solution:**
```powershell
# Clean install
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm run dev
```

### Problem: Backend won't start

**Solution:**
```powershell
cd backend

# Check if virtual environment exists
if (Test-Path "venv\Scripts\python.exe") {
    # Activate and install dependencies
    .\venv\Scripts\Activate.ps1
    pip install fastapi uvicorn beautifulsoup4 httpx lxml
    python simple_server.py
} else {
    # Create virtual environment
    python -m venv venv
    .\venv\Scripts\Activate.ps1
    pip install fastapi uvicorn beautifulsoup4 httpx lxml
    python simple_server.py
}
```

### Problem: Port 8000 already in use

**Solution:**
1. Find the process using port 8000:
   ```powershell
   netstat -ano | Select-String ":8000"
   ```

2. Kill the process (replace PID with actual process ID):
   ```powershell
   Stop-Process -Id <PID> -Force
   ```

3. Or change the backend port in `backend/simple_server.py`:
   ```python
   uvicorn.run(app, host="0.0.0.0", port=8001)  # Change to 8001
   ```

4. Update frontend API URL in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8001
   ```

### Problem: Port 3000 already in use

**Solution:**
```powershell
# Use a different port
$env:PORT=3001
npm run dev
```

Or kill the process:
```powershell
# Find process
netstat -ano | Select-String ":3000"
# Kill process (replace PID)
Stop-Process -Id <PID> -Force
```

## 📁 Project Structure

```
ai-accessibility-validator-and-auto-fixer/
├── app/                    # Next.js frontend application
│   ├── scanner/            # Scanner page
│   ├── components/         # React components
│   └── ...
├── backend/                # FastAPI backend server
│   ├── services/          # Backend services
│   ├── main.py            # Main server file
│   ├── simple_server.py   # Simplified server (recommended)
│   └── venv/              # Python virtual environment
├── extension/            # Browser extension
├── START_BACKEND.ps1     # PowerShell script to start backend
└── package.json           # Frontend dependencies
```

## 🔗 Important URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 📝 Quick Start Commands

### Start Everything (Two Terminals Required)

**Terminal 1 - Backend:**
```powershell
.\START_BACKEND.ps1
```

**Terminal 2 - Frontend:**
```powershell
npm run dev
```

### Stop Servers

**Backend:**
- Press `Ctrl+C` in the backend terminal
- Or close the terminal window

**Frontend:**
- Press `Ctrl+C` in the frontend terminal

## ✅ Verification Checklist

Before reporting issues, verify:

- [ ] Backend server is running (check http://localhost:8000/health)
- [ ] Frontend server is running (check http://localhost:3000)
- [ ] No port conflicts (8000 and 3000 are available)
- [ ] All dependencies installed (`npm install` and `pip install`)
- [ ] Virtual environment activated (for backend)
- [ ] Browser console shows no errors (F12 → Console)

## 🆘 Still Having Issues?

1. **Check the browser console** (F12 → Console) for errors
2. **Check backend terminal** for error messages
3. **Verify both servers are running** in separate terminals
4. **Restart both servers** if issues persist
5. **Check firewall/antivirus** isn't blocking localhost connections

## 📚 Additional Resources

- **Backend API Docs**: http://localhost:8000/docs (when backend is running)
- **Next.js Docs**: https://nextjs.org/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com/

---

**Last Updated**: $(Get-Date -Format "yyyy-MM-dd")
**Project Version**: 1.0.0

