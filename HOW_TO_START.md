# 🚀 How to Start Backend - Simple Instructions

## The Problem
**Error**: "Failed to scan URL. Make sure the backend is running."

**Why**: The backend server needs to be started manually before scanning will work.

## ✅ Solution - Start Backend

### **Method 1: Double-Click (Easiest) ⭐**

1. Go to the `backend` folder in File Explorer
2. Find `start_simple.bat`
3. **Double-click it**
4. A black window will open - **DON'T CLOSE IT!**
5. Wait for "Application startup complete"
6. **Done!** ✅ Backend is running

### **Method 2: PowerShell**

1. Open PowerShell
2. Type these commands:
   ```powershell
   cd C:\Users\Irfan\Desktop\ai-accessibility-validator-and-auto-fixer\backend
   python simple_server.py
   ```
3. Wait for "Application startup complete"
4. **Keep the window open!**

### **Method 3: Command Prompt**

1. Open CMD (Command Prompt)
2. Type:
   ```cmd
   cd C:\Users\Irfan\Desktop\ai-accessibility-validator-and-auto-fixer\backend
   python simple_server.py
   ```
3. Wait for startup message
4. **Keep the window open!**

## ✅ Verify It's Working

1. **Open your browser**
2. **Go to:** `http://localhost:8000/health`
3. **Should see:**
   ```json
   {"status": "healthy", "service": "accessibility-validator"}
   ```

If you see this, **backend is running!** ✅

## 🎯 Then Test Scanner

1. Open `http://localhost:3000` in your browser
2. Click "Scanner" in the menu
3. Check top-right - should show "🟢 Backend Online"
4. Type a URL (e.g., `https://example.com`)
5. Click "Scan Website"
6. **Should work!** ✅

## ⚠️ Important

- **Keep the backend window open** - if you close it, scanning stops
- Backend must run on port 8000
- You need both frontend AND backend running

## 🔧 Troubleshooting

**Can't find Python?**
- Install Python 3.8+ from python.org
- Check "Add Python to PATH" during installation

**Dependencies missing?**
```powershell
cd backend
pip install fastapi uvicorn beautifulsoup4 httpx lxml
```

**Port 8000 in use?**
- Close other programs using port 8000
- Or use a different port (requires code changes)

---

**Quick Start:**
1. Double-click `backend/start_simple.bat`
2. Keep window open
3. Go to `http://localhost:3000/scanner`
4. Scan a URL! ✅

