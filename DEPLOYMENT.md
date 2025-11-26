# 🚀 Complete Deployment Guide

This guide will help you deploy both the frontend (Next.js) and backend (FastAPI) of the AI Accessibility Validator.

## 📋 Table of Contents

1. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
2. [Backend Deployment Options](#backend-deployment-options)
   - [Option 1: Railway](#option-1-railway-recommended)
   - [Option 2: Render](#option-2-render)
   - [Option 3: Heroku](#option-3-heroku)
3. [Environment Variables](#environment-variables)
4. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Frontend Deployment (Vercel)

### Prerequisites
- GitHub/GitLab/Bitbucket account
- Vercel account (free tier available)

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Go to [vercel.com](https://vercel.com) and sign in**

3. **Click "New Project"**

4. **Import your repository**

5. **Configure project:**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

6. **Add Environment Variables:**
   - Go to "Environment Variables" section
   - Add: `NEXT_PUBLIC_API_URL` = `https://your-backend-url.railway.app` (or your backend URL)
   - Click "Add"

7. **Click "Deploy"**

8. **Wait for deployment to complete** (usually 2-3 minutes)

9. **Your frontend will be live at:** `https://your-project.vercel.app`

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **For production:**
   ```bash
   vercel --prod
   ```

5. **Set environment variables:**
   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   # Enter your backend URL when prompted
   ```

---

## Backend Deployment Options

### Option 1: Railway (Recommended)

Railway is easy to use and has a generous free tier.

#### Steps:

1. **Go to [railway.app](https://railway.app) and sign in with GitHub**

2. **Create a New Project**

3. **Add a Service → Deploy from GitHub repo**

4. **Select your repository**

5. **Configure the service:**
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

6. **Add Environment Variables (if needed):**
   - Go to Variables tab
   - Add any required environment variables

7. **Deploy:**
   - Railway will automatically detect the `railway.json` file
   - Or manually set the commands above

8. **Get your backend URL:**
   - Railway will provide a URL like: `https://your-app.railway.app`
   - Copy this URL

9. **Update CORS in backend:**
   - In `backend/main.py`, update the CORS origins:
   ```python
   allow_origins=[
       "https://your-frontend.vercel.app",
       "http://localhost:3000"  # For local development
   ]
   ```

10. **Update frontend environment variable:**
    - Go to Vercel dashboard → Your project → Settings → Environment Variables
    - Update `NEXT_PUBLIC_API_URL` with your Railway backend URL

### Option 2: Render

Render offers free tier with automatic deployments.

#### Steps:

1. **Go to [render.com](https://render.com) and sign in**

2. **Create a New Web Service**

3. **Connect your GitHub repository**

4. **Configure the service:**
   - Name: `ai-accessibility-backend`
   - Environment: **Python 3**
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Root Directory: Leave empty (or set to `backend`)

5. **Add Environment Variables:**
   - Click "Advanced" → "Add Environment Variable"
   - Add any required variables

6. **Deploy:**
   - Click "Create Web Service"
   - Render will automatically deploy

7. **Get your backend URL:**
   - Render will provide a URL like: `https://your-app.onrender.com`
   - Copy this URL

8. **Update CORS and frontend URL** (same as Railway steps above)

### Option 3: Heroku

Heroku requires a credit card for free tier but is reliable.

#### Steps:

1. **Install Heroku CLI:**
   ```bash
   # Windows
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login to Heroku:**
   ```bash
   heroku login
   ```

3. **Create a new app:**
   ```bash
   cd backend
   heroku create your-app-name
   ```

4. **Set buildpacks:**
   ```bash
   heroku buildpacks:set heroku/python
   ```

5. **Create `Procfile` in backend directory:**
   ```
   web: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

6. **Deploy:**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

7. **Get your backend URL:**
   - Your app will be at: `https://your-app-name.herokuapp.com`

---

## Environment Variables

### Frontend (Vercel)

Set these in Vercel Dashboard → Project Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

### Backend (Railway/Render/Heroku)

Set these in your backend platform's environment variables:

```
# Optional: Add any API keys or secrets here
# OPENAI_API_KEY=your-key-here (if using OpenAI)
# DATABASE_URL=your-database-url (if using a database)
```

---

## Post-Deployment Checklist

### Frontend
- [ ] Verify frontend loads at the deployed URL
- [ ] Check that all pages are accessible
- [ ] Test responsive design on mobile/tablet/desktop
- [ ] Verify API calls work (check browser console)
- [ ] Test dark mode functionality
- [ ] Check footer links work
- [ ] Verify navigation works on all devices

### Backend
- [ ] Verify backend health check: `https://your-backend-url/health`
- [ ] Check API documentation: `https://your-backend-url/docs`
- [ ] Test a scan request from frontend
- [ ] Verify CORS is working (no CORS errors in browser console)
- [ ] Check backend logs for any errors

### Integration
- [ ] Test scanning a URL from the frontend
- [ ] Test uploading an HTML file
- [ ] Verify auto-fix functionality works
- [ ] Check that reports are generated correctly

---

## Troubleshooting

### Frontend Issues

**Build Errors:**
- Check `next.config.js` for any issues
- Ensure all dependencies are in `package.json`
- Run `npm run lint` to check for TypeScript errors
- Check build logs in Vercel dashboard

**API Connection Issues:**
- Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Check CORS settings on backend
- Ensure backend is accessible from Vercel's servers
- Check browser console for error messages

### Backend Issues

**Deployment Fails:**
- Check that all dependencies are in `requirements.txt`
- Verify Python version compatibility
- Check build logs for specific errors
- Ensure `main.py` is in the correct directory

**CORS Errors:**
- Update CORS origins in `backend/main.py` to include your frontend URL
- Ensure `allow_origins` includes both production and localhost URLs

**Port Issues:**
- Backend platforms use `$PORT` environment variable
- Ensure start command uses `--port $PORT`
- Don't hardcode port numbers

### Performance Issues

- Enable Vercel Analytics in dashboard
- Check bundle size: `npm run build` shows sizes
- Optimize images and assets
- Consider enabling Vercel's Edge Network

---

## Quick Deploy Commands

### Frontend (Vercel CLI)
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Backend (Railway CLI)
```bash
npm i -g @railway/cli
railway login
railway link
railway up
```

---

## Cost Estimates

### Free Tier Options:
- **Vercel**: Free for personal projects (unlimited deployments)
- **Railway**: $5 free credit/month (usually enough for small projects)
- **Render**: Free tier available (with limitations)
- **Heroku**: Free tier discontinued, requires paid plan

### Recommended Setup:
- **Frontend**: Vercel (Free)
- **Backend**: Railway (Free tier with $5 credit) or Render (Free tier)

---

## Next Steps

1. ✅ Deploy frontend to Vercel
2. ✅ Deploy backend to Railway/Render
3. ✅ Update environment variables
4. ✅ Test all functionality
5. ✅ Set up custom domain (optional)
6. ✅ Configure monitoring and analytics

---

**Need Help?** Check the logs in your deployment platform's dashboard for detailed error messages.

