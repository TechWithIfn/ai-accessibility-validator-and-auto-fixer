# Complete Setup Guide

This guide will walk you through setting up the entire AI Web Accessibility Validator & Auto-Fixer project.

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+
- **Git** (optional, for cloning)

## Step 1: Backend Setup

### 1.1 Navigate to Backend Directory

```bash
cd backend
```

### 1.2 Create Virtual Environment

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

### 1.3 Install Dependencies

```bash
pip install -r requirements.txt
```

**Note:** Some packages may require additional system dependencies:
- On Ubuntu/Debian: `sudo apt-get install python3-dev`
- On macOS: May need Xcode Command Line Tools

### 1.4 Run Backend Server

```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### 1.5 Verify Backend is Running

Open your browser and visit:
- API Documentation: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

## Step 2: Frontend Setup

### 2.1 Install Dependencies

From the project root:
```bash
npm install
```

### 2.2 Configure Environment (Optional)

Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 2.3 Run Development Server

```bash
npm run dev
```

The dashboard will be available at `http://localhost:3000`

### 2.4 Build for Production (Optional)

```bash
npm run build
npm start
```

## Step 3: Browser Extension Setup

### 3.1 Open Extension Manager

**Chrome:**
1. Open Chrome
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)

**Edge:**
1. Open Edge
2. Navigate to `edge://extensions/`
3. Enable "Developer mode" (toggle in top left)

### 3.2 Load Extension

1. Click "Load unpacked" button
2. Navigate to the project folder
3. Select the `extension` folder
4. Click "Select Folder"

### 3.3 Configure Extension (If Needed)

Edit `extension/popup.js` and `extension/content.js`:
Change the `API_BASE_URL` if your backend is not at `http://localhost:8000`

### 3.4 Use Extension

1. Navigate to any website
2. Click the extension icon in your toolbar
3. Click "Scan This Page"
4. View issues in the sidebar

## Step 4: Verify Everything Works

### 4.1 Test Backend API

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status": "healthy", "service": "accessibility-validator"}
```

### 4.2 Test Frontend

1. Open http://localhost:3000
2. Navigate to "Scanner" page
3. Enter a URL or upload HTML
4. Click "Scan"

### 4.3 Test Browser Extension

1. Visit any website
2. Click extension icon
3. Click "Scan This Page"
4. Verify sidebar appears with results

## Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Change port in main.py or use:
uvicorn main:app --port 8001
```

**Missing dependencies:**
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Permission errors:**
```bash
# Use virtual environment or sudo (not recommended)
```

### Frontend Issues

**Port 3000 in use:**
```bash
# Kill existing process or:
PORT=3001 npm run dev
```

**Dependencies not installing:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**API connection errors:**
- Ensure backend is running
- Check CORS settings in `backend/main.py`
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`

### Extension Issues

**Extension not loading:**
- Check for errors in extension console (`chrome://extensions/` → Details → Inspect views)
- Ensure all files are in the `extension` folder
- Check `manifest.json` syntax

**Can't connect to backend:**
- Update `API_BASE_URL` in `popup.js` and `content.js`
- Ensure backend is running
- Check browser console for errors

## Development Tips

### Hot Reload

- Backend: Use `uvicorn main:app --reload`
- Frontend: Next.js has built-in hot reload
- Extension: Reload extension after changes (`chrome://extensions/` → Reload)

### Debugging

**Backend:**
- Check logs in terminal
- Use `http://localhost:8000/docs` for interactive API testing

**Frontend:**
- Use browser DevTools (F12)
- Check Network tab for API calls

**Extension:**
- Right-click extension → Inspect popup
- Check background service worker logs
- Use `chrome://extensions/` → Service worker → Inspect

## Next Steps

1. **Integrate Real ML Models:**
   - Add BLIP for image captioning
   - Add GPT-4 Vision for advanced analysis

2. **Add Database:**
   - Set up PostgreSQL or MongoDB
   - Store scan results
   - Enable user accounts

3. **Deploy:**
   - Backend: Deploy to Heroku, Railway, or AWS
   - Frontend: Deploy to Vercel or Netlify
   - Extension: Publish to Chrome Web Store

## Support

For issues or questions:
1. Check the main README.md
2. Review API docs at `/docs`
3. Open an issue on GitHub

---

**Happy coding! 🚀**

