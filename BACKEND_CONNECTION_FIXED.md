# Backend Connection Issue - FIXED ✅

## Problem
The frontend was showing "Cannot connect to backend" error when trying to scan URLs.

## Solutions Implemented

### 1. ✅ Fixed Backend Server (`simple_server.py`)
- **Improved URL validation**: Automatically adds `https://` protocol if missing
- **Better error handling**: More descriptive error messages for connection issues
- **Enhanced timeout handling**: Proper timeout and connection error detection
- **User-Agent header**: Added to avoid blocking by some websites

### 2. ✅ Reliable Startup Scripts
Created multiple ways to start the backend:

#### Windows Batch File (Easiest)
- **File**: `backend/start_server.bat` or `backend/start_backend_reliable.bat`
- **Usage**: Double-click the file
- **What it does**:
  - Checks if Python is installed
  - Creates virtual environment if needed
  - Installs dependencies automatically
  - Starts the server

#### PowerShell Script
- **File**: `START_BACKEND.ps1` (in project root)
- **Usage**: Run from PowerShell: `.\START_BACKEND.ps1`

#### Manual Start
```bash
cd backend
venv\Scripts\activate  # Windows
# or: source venv/bin/activate  # Mac/Linux
python simple_server.py
```

### 3. ✅ Improved Frontend Error Messages
- Clear instructions when backend is offline
- Step-by-step guide to start the backend
- Better error handling for different failure scenarios

## How to Use

### Step 1: Start the Backend
Choose one method:

**Option A - Windows (Easiest):**
1. Navigate to `backend` folder
2. Double-click `start_server.bat`
3. Wait for "Starting Backend Server..." message
4. Keep the terminal window open

**Option B - PowerShell:**
```powershell
.\START_BACKEND.ps1
```

**Option C - Manual:**
```bash
cd backend
python simple_server.py
```

### Step 2: Verify Backend is Running
1. Open browser
2. Go to: `http://localhost:8000/health`
3. You should see: `{"status":"healthy","service":"accessibility-validator"}`

### Step 3: Use the Scanner
1. Open the frontend (usually `http://localhost:3000`)
2. Go to Scanner page
3. Enter a URL (e.g., `https://example.com`)
4. Click "Scan URL"
5. Results should appear!

## Troubleshooting

### "Cannot connect to backend" Error

**Check 1: Is backend running?**
- Open `http://localhost:8000/health` in browser
- If it doesn't load → backend is not running
- Solution: Start the backend using one of the methods above

**Check 2: Port 8000 in use?**
- Another application might be using port 8000
- Solution: Close other applications or change port in `simple_server.py`

**Check 3: Python not found?**
- Install Python 3.8+ from https://www.python.org/
- Make sure Python is added to PATH during installation

**Check 4: Dependencies missing?**
- Activate virtual environment
- Run: `pip install fastapi uvicorn httpx beautifulsoup4 lxml`

### "Failed to fetch website" Error

This means the backend is running but can't access the URL:
- Check if the URL is correct
- Some websites block automated requests
- Try a different URL (e.g., `https://example.com`)

### "Request timeout" Error

- The website is taking too long to respond
- Try a different URL
- Check your internet connection

## Files Changed

1. `backend/simple_server.py` - Improved URL handling and error messages
2. `backend/start_server.bat` - Enhanced startup script with better error handling
3. `backend/start_backend_reliable.bat` - New reliable startup script
4. `START_BACKEND.ps1` - PowerShell startup script
5. `app/scanner/page.tsx` - Better error messages with instructions
6. `QUICK_START_BACKEND.md` - Quick start guide

## Testing

To verify everything works:

1. **Start backend:**
   ```bash
   cd backend
   python simple_server.py
   ```

2. **Test health endpoint:**
   ```bash
   curl http://localhost:8000/health
   ```
   Should return: `{"status":"healthy","service":"accessibility-validator"}`

3. **Test URL scan:**
   - Open frontend
   - Go to Scanner page
   - Enter: `https://example.com`
   - Click "Scan URL"
   - Should see results!

## Notes

- Keep the backend terminal window open while using the app
- The backend must be running before scanning URLs
- `simple_server.py` is more reliable than `main.py` (fewer dependencies)
- Backend runs on `http://localhost:8000` by default
- Frontend connects to backend automatically

## Success Indicators

✅ Backend terminal shows: "Starting Backend Server..."
✅ Health check returns: `{"status":"healthy"}`
✅ Scanner page shows: "Backend Online" (green indicator)
✅ URL scans complete successfully
✅ No "Cannot connect to backend" errors

---

**All backend connection issues have been resolved!** 🎉
