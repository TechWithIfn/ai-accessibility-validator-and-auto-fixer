# Quick Start Guide - Fix Backend Connection Issue

## 🚨 Problem
**Error**: "Failed to scan URL. Make sure the backend is running."

## ✅ Solution - Step by Step

### Step 1: Start Backend Server

**Option A - Windows Batch File (Easiest):**
1. Navigate to the `backend` folder
2. Double-click `start_server.bat`
3. Wait for server to start (you'll see "Server starting on http://localhost:8000")

**Option B - PowerShell:**
```powershell
cd backend
.\venv\Scripts\activate
python main.py
```

**Option C - Python Direct:**
```powershell
cd backend
python main.py
```

### Step 2: Verify Backend is Running

1. Open your browser
2. Go to: `http://localhost:8000/health`
3. You should see: `{"status": "healthy", "service": "accessibility-validator"}`

### Step 3: Start Frontend (if not already running)

```bash
npm run dev
```

The frontend should be at: `http://localhost:3000`

### Step 4: Test the Scanner

1. Go to `http://localhost:3000/scanner`
2. Check top-right corner - should show "🟢 Backend Online"
3. Enter a URL (e.g., `https://example.com`)
4. Click "Scan Website"

## 🔧 Troubleshooting

### Backend Won't Start

**Issue**: Python not found
**Solution**: 
- Install Python 3.8+ from python.org
- Make sure to check "Add Python to PATH" during installation

**Issue**: Dependencies missing
**Solution**:
```powershell
cd backend
python -m pip install --upgrade pip
pip install -r requirements.txt
```

**Issue**: Port 8000 already in use
**Solution**: 
- Close other applications using port 8000
- Or change port in `backend/main.py` (line 250):
  ```python
  uvicorn.run(app, host="0.0.0.0", port=8001)  # Change to 8001
  ```
- Update `app/scanner/page.tsx` line 8:
  ```typescript
  const API_BASE_URL = 'http://localhost:8001';
  ```

### Backend Status Shows Offline

1. **Check if backend is actually running:**
   - Open browser: `http://localhost:8000/health`
   - Should show: `{"status": "healthy"}`

2. **Check backend logs:**
   - Look at the terminal where backend is running
   - Check for any error messages

3. **Check firewall:**
   - Windows Firewall might be blocking port 8000
   - Allow Python through firewall

### Still Not Working?

1. **Verify backend is running:**
   ```powershell
   # Test with PowerShell
   Invoke-RestMethod -Uri "http://localhost:8000/health"
   ```

2. **Check backend logs for errors**

3. **Verify CORS is enabled** (already done in main.py)

4. **Try restarting both frontend and backend**

## 📝 Manual Start (Detailed)

### Backend:
```powershell
# 1. Navigate to backend folder
cd C:\Users\Irfan\Desktop\ai-accessibility-validator-and-auto-fixer\backend

# 2. Activate virtual environment (if exists)
.\venv\Scripts\activate

# 3. Install dependencies (if needed)
pip install fastapi uvicorn

# 4. Start server
python main.py
```

### Frontend:
```bash
# In a separate terminal
npm run dev
```

## ✅ Success Indicators

When everything is working:
- ✅ Backend terminal shows: "Application startup complete"
- ✅ Browser shows: `http://localhost:8000/health` returns `{"status": "healthy"}`
- ✅ Frontend shows: "🟢 Backend Online" in scanner page
- ✅ Scanning a URL works without errors

---

**Need Help?**
- Check `START_BACKEND.md` for detailed instructions
- Check backend terminal for error messages
- Verify Python version: `python --version` (should be 3.8+)

