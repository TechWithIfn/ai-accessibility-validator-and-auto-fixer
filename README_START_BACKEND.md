# 🚨 IMPORTANT: Start Backend Before Using Scanner

## Problem
**Error**: "Failed to scan URL. Make sure the backend is running."

## ✅ Solution - Start Backend Server

### Step 1: Open Backend Folder

**Option A - File Explorer:**
1. Open File Explorer (Windows Key + E)
2. Go to: `C:\Users\Irfan\Desktop\ai-accessibility-validator-and-auto-fixer\backend`

**Option B - PowerShell:**
```powershell
cd C:\Users\Irfan\Desktop\ai-accessibility-validator-and-auto-fixer\backend
```

### Step 2: Start Backend Server

**Option A - Double-click (Easiest):**
1. In the `backend` folder, find `start_simple.bat`
2. Double-click it
3. A black window will open - **DON'T CLOSE IT!**
4. Wait until you see: "Application startup complete"

**Option B - PowerShell:**
```powershell
cd backend
python simple_server.py
```
A window will open - **KEEP IT OPEN!**

### Step 3: Verify Backend is Running

1. Open your browser
2. Go to: `http://localhost:8000/health`
3. You should see:
   ```json
   {"status": "healthy", "service": "accessibility-validator"}
   ```

✅ **If you see this, backend is running!**

### Step 4: Use Scanner

1. Open frontend: `http://localhost:3000`
2. Go to Scanner page
3. Top-right should show: "🟢 Backend Online"
4. Enter a URL (e.g., `https://example.com`)
5. Click "Scan Website"
6. **Should work!** ✅

## ⚠️ Important

- **Keep the backend window open** while using the scanner
- If you close it, scanning will fail
- Backend must run on `http://localhost:8000`
- Frontend must run on `http://localhost:3000`

## 🔧 Troubleshooting

### Backend Won't Start

**Install dependencies first:**
```powershell
cd backend
pip install fastapi uvicorn beautifulsoup4 httpx lxml
```

**Then start:**
```powershell
python simple_server.py
```

### Port Already in Use

If port 8000 is already in use:
1. Close other applications using port 8000
2. Or change port in `simple_server.py` (line 245)

### Python Not Found

1. Install Python 3.8+ from python.org
2. Make sure to check "Add Python to PATH" during installation

---

**Quick Start Command:**
```powershell
cd C:\Users\Irfan\Desktop\ai-accessibility-validator-and-auto-fixer\backend
python simple_server.py
```

**Then keep that window open and use the scanner!** ✅

