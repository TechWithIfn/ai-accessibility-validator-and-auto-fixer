# 🚀 START BACKEND NOW - Quick Instructions

## ✅ Problem: "Failed to scan URL. Make sure the backend is running."

## 🎯 Solution: Start Backend Server

### **EASIEST WAY (Windows):**

1. **Open File Explorer**
2. **Navigate to:** `C:\Users\Irfan\Desktop\ai-accessibility-validator-and-auto-fixer\backend`
3. **Double-click:** `start_simple.bat`
4. **Wait** until you see: "Application startup complete"
5. **Keep the window open** (don't close it!)

### **OR Using PowerShell:**

1. **Open PowerShell**
2. **Run these commands:**
   ```powershell
   cd C:\Users\Irfan\Desktop\ai-accessibility-validator-and-auto-fixer\backend
   python simple_server.py
   ```
3. **Wait** until you see: "Application startup complete"
4. **Keep the window open** (don't close it!)

## ✅ Verify Backend is Running

1. **Open your browser**
2. **Go to:** `http://localhost:8000/health`
3. **You should see:**
   ```json
   {"status": "healthy", "service": "accessibility-validator"}
   ```

## 🎯 Then Test Scanning

1. **Open frontend:** `http://localhost:3000`
2. **Go to Scanner page** (`/scanner`)
3. **Check top-right corner** - should show "🟢 Backend Online"
4. **Enter URL:** `https://example.com`
5. **Click "Scan Website"**
6. **Should work!** ✅

## 🔧 If Backend Won't Start

### Install Dependencies First:
```powershell
cd C:\Users\Irfan\Desktop\ai-accessibility-validator-and-auto-fixer\backend
pip install fastapi uvicorn beautifulsoup4 httpx lxml
```

### Then Start:
```powershell
python simple_server.py
```

## 📝 Important Notes

- ⚠️ **Keep the backend window open** while using the app
- ✅ **Backend runs on:** `http://localhost:8000`
- ✅ **Frontend runs on:** `http://localhost:3000`
- ✅ **You need BOTH running** for scanning to work

---

**Status**: ✅ Ready to start
**Next Step**: Start backend using instructions above

