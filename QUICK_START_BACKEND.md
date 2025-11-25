# Quick Start - Backend Server

## 🚀 Starting the Backend Server

### Option 1: Using Batch File (Recommended for Windows)
1. Navigate to the `backend` folder
2. Double-click `start_server.bat` or `start_backend_reliable.bat`
3. Wait for the server to start (you'll see "Starting Backend Server...")
4. The server will be available at `http://localhost:8000`

### Option 2: Using PowerShell Script
1. From the project root, run:
   ```powershell
   .\START_BACKEND.ps1
   ```

### Option 3: Manual Start
1. Open terminal/command prompt
2. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
3. Activate virtual environment:
   ```bash
   # Windows
   venv\Scripts\activate
   
   # Mac/Linux
   source venv/bin/activate
   ```
4. Install dependencies (if not already installed):
   ```bash
   pip install fastapi uvicorn httpx beautifulsoup4 lxml
   ```
5. Start the server:
   ```bash
   python simple_server.py
   ```

## ✅ Verify Backend is Running

Once started, you should see:
```
🚀 Starting AI Accessibility Validator Backend
📍 Server: http://localhost:8000
📚 API Docs: http://localhost:8000/docs
💚 Health: http://localhost:8000/health
```

### Test the Backend:
1. Open browser and go to: `http://localhost:8000/health`
2. You should see: `{"status":"healthy","service":"accessibility-validator"}`
3. API documentation: `http://localhost:8000/docs`

## 🔧 Troubleshooting

### "Cannot connect to backend" Error
1. **Check if backend is running:**
   - Open `http://localhost:8000/health` in browser
   - If it doesn't load, the backend is not running

2. **Start the backend:**
   - Use one of the methods above to start the server
   - Make sure you see "Starting Backend Server..." message

3. **Check port 8000:**
   - Make sure no other application is using port 8000
   - You can change the port in `simple_server.py` if needed

### "Python is not installed" Error
- Install Python 3.8+ from https://www.python.org/
- Make sure Python is added to PATH during installation

### "Failed to create virtual environment" Error
- Make sure Python is properly installed
- Try running: `python -m venv venv` manually

### "Module not found" Error
- Activate virtual environment
- Install dependencies: `pip install fastapi uvicorn httpx beautifulsoup4 lxml`

## 📝 Notes

- The backend must be running before using the scanner
- Keep the backend terminal window open while using the app
- Press `Ctrl+C` to stop the server
- The simple_server.py is more reliable and has fewer dependencies
