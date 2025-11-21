# ✅ How to Fix "Failed to scan URL" Error

## Problem
**Error**: "Failed to scan URL. Make sure the backend is running."

## Solution: Start the Backend Server

### **QUICK START (3 Steps):**

#### Step 1: Open Backend Folder
1. Press **Windows Key + R**
2. Type: `C:\Users\Irfan\Desktop\ai-accessibility-validator-and-auto-fixer\backend`
3. Press Enter

#### Step 2: Start Backend
**Option A - Double-click:**
- Find `start_simple.bat` in the folder
- **Double-click it**
- A black window will open

**Option B - PowerShell:**
- Right-click in the folder
- Select "Open in Terminal" or "Open PowerShell window here"
- Type: `python simple_server.py`
- Press Enter

#### Step 3: Wait & Keep Window Open
- Wait until you see: **"Application startup complete"**
- **Keep this window open!** (Don't close it)
- Backend is now running ✅

### **VERIFY IT'S WORKING:**

1. Open your browser
2. Go to: `http://localhost:8000/health`
3. You should see: `{"status": "healthy", "service": "accessibility-validator"}`

✅ **If you see this, backend is working!**

### **NOW TEST SCANNER:**

1. Open frontend: `http://localhost:3000`
2. Go to Scanner page
3. Top-right should show: **"🟢 Backend Online"**
4. Enter URL: `https://example.com`
5. Click "Scan Website"
6. **Should work!** ✅

## ⚠️ Important

- **Keep the backend window open** while using the scanner
- If you close it, scanning will fail
- The backend window must stay running

## 🔧 If It Won't Start

### Install Dependencies:
```powershell
cd C:\Users\Irfan\Desktop\ai-accessibility-validator-and-auto-fixer\backend
pip install fastapi uvicorn beautifulsoup4 httpx lxml
```

### Then Start:
```powershell
python simple_server.py
```

---

**Summary:**
1. ✅ Double-click `backend/start_simple.bat`
2. ✅ Keep window open
3. ✅ Go to `http://localhost:3000/scanner`
4. ✅ Scan a URL!

**That's it!** 🎉
