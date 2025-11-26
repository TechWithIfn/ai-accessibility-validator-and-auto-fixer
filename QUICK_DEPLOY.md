# 🚀 Quick Deployment Guide

## Frontend (Next.js) - Deploy to Vercel

### Option 1: Via Vercel Dashboard (Easiest)

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to [vercel.com](https://vercel.com) → New Project → Import Repository**

3. **Configure:**
   - Framework: Next.js (auto-detected)
   - Environment Variable: `NEXT_PUBLIC_API_URL` = `https://your-backend-url.railway.app`

4. **Click Deploy** ✅

### Option 2: Via Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
vercel env add NEXT_PUBLIC_API_URL
```

---

## Backend (FastAPI) - Deploy to Railway

1. **Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub**

2. **Select your repository**

3. **Configure:**
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **Get your backend URL** (e.g., `https://your-app.railway.app`)

5. **Update CORS in `backend/main.py`:**
   ```python
   allow_origins=[
       "https://your-frontend.vercel.app",
       "http://localhost:3000"
   ]
   ```

6. **Update frontend environment variable in Vercel** with your backend URL

---

## Alternative: Deploy Backend to Render

1. **Go to [render.com](https://render.com) → New Web Service**

2. **Connect GitHub repository**

3. **Configure:**
   - Environment: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **Deploy** ✅

---

## Post-Deployment Checklist

- [ ] Frontend loads at Vercel URL
- [ ] Backend health check works: `https://your-backend-url/health`
- [ ] API docs accessible: `https://your-backend-url/docs`
- [ ] Frontend can connect to backend (check browser console)
- [ ] Test scanning a URL from frontend
- [ ] No CORS errors in browser console

---

## Environment Variables Summary

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

### Backend (Railway/Render)
```
PORT (automatically set by platform)
```

---

**For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

