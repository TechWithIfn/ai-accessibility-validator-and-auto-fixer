# 🚀 Netlify Deployment Guide - Fixing 404 Errors

## Problem: 404 "Page not found" Errors

If you're seeing 404 errors on Netlify, it's because Next.js uses client-side routing and Netlify needs proper configuration to handle it.

## ✅ Solution

### Step 1: Install Netlify Next.js Plugin

The `netlify.toml` file is already configured, but you need to ensure the plugin is installed:

**Option A: Automatic (Recommended)**
- Netlify will automatically detect and install the plugin when you deploy
- Make sure `netlify.toml` is in your repository root

**Option B: Manual Installation**
1. Go to your Netlify Dashboard
2. Navigate to: **Site settings → Build & deploy → Plugins**
3. Click **"Add plugin"**
4. Search for **"@netlify/plugin-nextjs"**
5. Click **"Install"**

### Step 2: Update Netlify Build Settings

1. Go to **Netlify Dashboard → Site settings → Build & deploy → Build settings**
2. Ensure these settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next` (or leave empty - plugin handles it)
   - **Node version:** `18` (or `20`)

### Step 3: Redeploy

1. Go to **Deploys** tab
2. Click **"Trigger deploy" → "Clear cache and deploy site"**
3. Wait for deployment to complete

### Step 4: Verify

After deployment, test these URLs:
- `https://your-site.netlify.app/` (homepage)
- `https://your-site.netlify.app/scanner`
- `https://your-site.netlify.app/reports`
- `https://your-site.netlify.app/dashboard`

All should work without 404 errors.

## 🔧 Alternative Solution (If Plugin Doesn't Work)

If the plugin still doesn't work, try this:

### Update `netlify.toml`:

```toml
[build]
  command = "npm run build && npm run export"
  publish = "out"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

**Note:** This requires adding `output: 'export'` to `next.config.js`, which disables some Next.js features. Only use if the plugin approach doesn't work.

## 📋 Files Created

- ✅ `netlify.toml` - Netlify configuration
- ✅ `public/_redirects` - Fallback redirect rules

## 🐛 Troubleshooting

### Still Getting 404s?

1. **Check Build Logs:**
   - Go to **Deploys → [Latest Deploy] → Build log**
   - Look for errors or warnings about the Next.js plugin

2. **Verify Plugin is Running:**
   - In build logs, you should see: `@netlify/plugin-nextjs`
   - If not, the plugin isn't installed

3. **Clear Cache and Redeploy:**
   - **Deploys → Trigger deploy → Clear cache and deploy site**

4. **Check Environment Variables:**
   - Ensure `NEXT_PUBLIC_API_URL` is set if your app needs it
   - **Site settings → Environment variables**

5. **Verify Build Output:**
   - Build should create `.next` folder
   - Check build logs for any errors

### Common Issues

**Issue:** "Plugin not found"
- **Solution:** Install `@netlify/plugin-nextjs` manually in Netlify dashboard

**Issue:** "Build fails"
- **Solution:** Check Node version (should be 18 or 20)
- **Solution:** Check `package.json` has all dependencies

**Issue:** "Routes work but show blank page"
- **Solution:** Check browser console for JavaScript errors
- **Solution:** Verify `NEXT_PUBLIC_API_URL` is set correctly

## 📝 Next Steps

1. ✅ Commit and push the `netlify.toml` file
2. ✅ Install the Netlify Next.js plugin in dashboard
3. ✅ Trigger a new deployment with cache cleared
4. ✅ Test all routes
5. ✅ Set environment variables if needed

## 🔗 Useful Links

- [Netlify Next.js Plugin Docs](https://github.com/netlify/netlify-plugin-nextjs)
- [Netlify Build Settings](https://docs.netlify.com/configure-builds/overview/)
- [Next.js on Netlify](https://docs.netlify.com/integrations/frameworks/next-js/)

---

**After following these steps, your 404 errors should be resolved!** 🎉

