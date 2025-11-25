# 🚀 Start Backend Server - Quick Guide

## ✅ Backend Setup Complete!

The virtual environment and dependencies have been set up. Now you need to **start the backend server**.

## 📋 How to Start the Backend

### **Method 1: Double-Click (Easiest)** ⭐

1. **Open File Explorer**
2. **Navigate to:** `ai-accessibility-validator-and-auto-fixer\backend`
3. **Double-click:** `start_server.bat`
4. **Wait for:** A terminal window to open showing:
   ```
   ================================================
   Starting FastAPI server...
   ================================================
   Server: http://localhost:8000
   ```
5. **Keep this window open** while using the app

### **Method 2: PowerShell**

1. **Open PowerShell** in the project root
2. **Run:**
   ```powershell
   .\START_BACKEND.ps1
   ```

### **Method 3: Manual Command**

1. **Open PowerShell or Command Prompt**
2. **Navigate to backend folder:**
   ```powershell
   cd backend
   ```
3. **Activate virtual environment:**
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```
4. **Start server:**
   ```powershell
   python simple_server.py
   ```

## ✅ Verify Backend is Running

### Option 1: Check in Browser
1. Open browser
2. Go to: **http://localhost:8000/health**
3. You should see: `{"status":"healthy","service":"accessibility-validator"}`

### Option 2: Use Check Script
Run from project root:
```powershell
.\CHECK_BACKEND.ps1
```

## 🎯 Once Backend is Running

1. ✅ Backend terminal shows: "Starting Backend Server..."
2. ✅ Health check works: http://localhost:8000/health
3. ✅ Frontend shows: "Backend Online" (green indicator)
4. ✅ You can now scan URLs!

## ⚠️ Troubleshooting

### "Port 8000 is already in use"
- Another application is using port 8000
- Close other applications or restart your computer
- Or change the port in `simple_server.py` (line 217): `port=8001`

### "Python is not installed"
- Install Python 3.8+ from https://www.python.org/
- Make sure to check "Add Python to PATH" during installation

### "Module not found" error
- The virtual environment might not be activated
- Make sure you see `(venv)` in your terminal prompt
- If not, run: `.\venv\Scripts\Activate.ps1`

### Backend starts but immediately closes
- Check the error message in the terminal
- Make sure all dependencies are installed
- Try: `pip install fastapi uvicorn httpx beautifulsoup4 lxml`

## 📝 Important Notes

- **Keep the backend terminal window open** while using the app
- The backend must be running before scanning URLs
- If you close the terminal, the backend stops
- To stop the backend: Press `Ctrl+C` in the terminal

## 🎉 Success Indicators

When everything is working:
- ✅ Terminal shows: "🚀 Starting AI Accessibility Validator Backend"
- ✅ Browser shows: `{"status":"healthy"}` at http://localhost:8000/health
- ✅ Frontend scanner page shows: "Backend Online" (green)
- ✅ URL scanning works without errors!

---

**Ready to start?** Just double-click `backend\start_server.bat`! 🚀
