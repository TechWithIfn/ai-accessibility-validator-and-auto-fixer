# ⚡ Quick Start Guide

## 🎯 Common Problems

### Problem 1: "Failed to scan code. No response from server"
This means the **backend server is not running**.

### Problem 2: "ChunkLoadError: Loading chunk app/layout failed"
This means the **frontend needs to be restarted with a clean cache**.

## ✅ The Solution (3 Simple Steps)

### Step 1: Start Backend Server

**Open PowerShell/Terminal and run:**

```powershell
.\START_BACKEND.ps1
```

**OR manually:**

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python simple_server.py
```

**Wait for this message:**
```
🚀 Starting AI Accessibility Validator Backend
📍 Server: http://localhost:8000
```

### Step 2: Start Frontend Server

**Open a NEW PowerShell/Terminal window and run:**

```powershell
.\START_FRONTEND.ps1
```

**OR manually (if you see ChunkLoadError):**

```powershell
# Clear cache first
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```

**Wait for this message:**
```
▲ Next.js ready
- Local: http://localhost:3000
```

### Step 3: Refresh Your Browser

1. Go to http://localhost:3000
2. Press `F5` or click refresh
3. The error should be gone! ✅

## 🔍 How to Verify It's Working

1. **Check Backend**: Open http://localhost:8000/health
   - Should show: `{"status":"healthy"}`

2. **Check Frontend**: Open http://localhost:3000
   - Should show dashboard with "Backend Online" indicator

3. **Test Scan**: Go to Scanner page → Enter URL → Click Scan
   - Should work without errors!

## ⚠️ Common Issues

### Issue: "Port 8000 already in use"
**Fix**: Kill the process using port 8000:
```powershell
netstat -ano | Select-String ":8000"
Stop-Process -Id <PID> -Force
```

### Issue: "Cannot find module"
**Fix**: Install dependencies:
```powershell
npm install
```

### Issue: Backend won't start
**Fix**: Install Python dependencies:
```powershell
cd backend
.\venv\Scripts\Activate.ps1
pip install fastapi uvicorn beautifulsoup4 httpx lxml
python simple_server.py
```

## 📝 Remember

- **Backend must run FIRST** before frontend
- **Keep both terminals open** while using the app
- **Backend runs on port 8000**
- **Frontend runs on port 3000**

---

**Need more help?** See `PROJECT_SETUP_COMPLETE.md` for detailed troubleshooting.
