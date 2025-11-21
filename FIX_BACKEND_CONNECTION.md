# 🔧 Fix: "Failed to scan URL. Make sure the backend is running."

## ✅ SOLUTION - Step by Step

### **Step 1: Start Backend Server**

**Open PowerShell or Command Prompt and run:**

```powershell
# Navigate to backend folder
cd C:\Users\Irfan\Desktop\ai-accessibility-validator-and-auto-fixer\backend

# Start the simple server
python simple_server.py
```

**OR double-click:**
- `backend/start_simple.bat`

### **Step 2: Wait for Server to Start**

You should see output like:
```
============================================================
🚀 Starting AI Accessibility Validator Backend
============================================================
📍 Server: http://localhost:8000
📚 API Docs: http://localhost:8000/docs
💚 Health: http://localhost:8000/health
============================================================
Press Ctrl+C to stop the server

INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

**Keep this window open!** ✅

### **Step 3: Verify Backend is Running**

**In a NEW browser window:**
1. Go to: `http://localhost:8000/health`
2. Should see: `{"status": "healthy", "service": "accessibility-validator"}`

✅ **If you see this, backend is working!**

### **Step 4: Test Scanner**

1. **Open frontend:** `http://localhost:3000`
2. **Go to Scanner page** (`/scanner`)
3. **Check top-right** - should show "🟢 Backend Online"
4. **Enter URL:** `https://example.com`
5. **Click "Scan Website"**
6. **Should work!** ✅

## 🔧 If Backend Won't Start

### Install Missing Dependencies:

```powershell
cd backend
pip install fastapi uvicorn beautifulsoup4 httpx lxml
```

### Then Start Again:

```powershell
python simple_server.py
```

## ⚠️ Important Notes

- **Keep the backend window open** while using the scanner
- **Don't close** the PowerShell/CMD window running the backend
- Backend runs on: `http://localhost:8000`
- Frontend runs on: `http://localhost:3000`

## 🎯 Quick Commands

**Start Backend:**
```powershell
cd backend && python simple_server.py
```

**Check Backend:**
```powershell
# Open in browser: http://localhost:8000/health
```

**Or in PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/health"
```

---

**Status**: Ready to start
**Next**: Follow Step 1 above to start backend

