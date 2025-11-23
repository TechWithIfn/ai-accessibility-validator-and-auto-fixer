# 🚀 Vercel Deployment Guide

## Quick Deploy to Vercel

### Step 1: Prepare Your Project

1. **Ensure all dependencies are installed:**
   ```bash
   npm install
   ```

2. **Build the project locally to check for errors:**
   ```bash
   npm run build
   ```

3. **Test locally:**
   ```bash
   npm run dev
   ```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI

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

#### Option B: Using Vercel Dashboard

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Go to [vercel.com](https://vercel.com) and sign in**

3. **Click "New Project"**

4. **Import your repository**

5. **Configure project:**
   - Framework Preset: Next.js
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

6. **Add Environment Variables:**
   - `NEXT_PUBLIC_API_URL`: Your backend API URL
   - Any other environment variables your app needs

7. **Click "Deploy"**

### Step 3: Configure Backend

Since the backend runs separately, you have two options:

#### Option A: Deploy Backend to Vercel (Serverless Functions)

1. Create API routes in `app/api/` directory
2. Vercel will automatically handle them as serverless functions

#### Option B: Deploy Backend Separately

1. Deploy backend to a separate service (Railway, Render, Heroku, etc.)
2. Update `NEXT_PUBLIC_API_URL` environment variable in Vercel
3. Update `vercel.json` rewrite rules if needed

### Step 4: Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### Step 5: Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Post-Deployment Checklist

- [ ] Verify all pages load correctly
- [ ] Test responsive design on mobile/tablet/desktop
- [ ] Check that API calls work (if backend is deployed)
- [ ] Verify environment variables are set
- [ ] Test dark mode functionality
- [ ] Check footer links work
- [ ] Verify navigation works on all devices

## Troubleshooting

### Build Errors

- Check `next.config.js` for any issues
- Ensure all dependencies are in `package.json`
- Check for TypeScript errors: `npm run lint`

### API Connection Issues

- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS settings on backend
- Ensure backend is accessible from Vercel's servers

### Performance Issues

- Enable Vercel Analytics
- Check bundle size: `npm run build` shows sizes
- Optimize images and assets

## Files Included for Vercel

- ✅ `vercel.json` - Vercel configuration
- ✅ `.vercelignore` - Files to exclude from deployment
- ✅ `next.config.js` - Next.js configuration
- ✅ `package.json` - Dependencies and scripts

## Notes

- The `backend/` folder is excluded from deployment (see `.vercelignore`)
- Backend should be deployed separately or use Vercel serverless functions
- All frontend pages are ready for deployment
- Responsive design works on all screen sizes

---

**Ready to deploy!** 🎉

