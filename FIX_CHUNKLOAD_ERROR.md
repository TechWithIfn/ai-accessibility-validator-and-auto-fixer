# 🔧 Fix: ChunkLoadError - Loading chunk app/layout failed

## ❌ Error Message
```
ChunkLoadError: Loading chunk app/layout failed.
(timeout: http://localhost:3000/_next/static/chunks/app/layout.js)
```

## 🔍 What This Means
This error occurs when:
- Next.js build cache is corrupted
- Dev server needs to be restarted
- Stale connections are blocking the server

## ✅ Solution (3 Steps)

### Step 1: Stop All Node Processes
```powershell
# Kill any running Node.js processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Step 2: Clear Next.js Cache
```powershell
# Remove build cache
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "node_modules/.cache" -ErrorAction SilentlyContinue
```

### Step 3: Restart Frontend Server
```powershell
# Use the startup script (recommended)
.\START_FRONTEND.ps1

# OR manually
npm run dev
```

## 🚀 Quick Fix Script

I've created `START_FRONTEND.ps1` that does all of this automatically:

```powershell
.\START_FRONTEND.ps1
```

This script will:
1. ✅ Check and install dependencies if needed
2. ✅ Clear Next.js cache (.next directory)
3. ✅ Clear node_modules cache
4. ✅ Start the dev server fresh

## 📝 Manual Steps (If Script Doesn't Work)

1. **Close all browser tabs** with localhost:3000
2. **Stop the dev server** (Ctrl+C in terminal)
3. **Clear cache:**
   ```powershell
   Remove-Item -Recurse -Force .next
   Remove-Item -Recurse -Force "node_modules/.cache"
   ```
4. **Restart:**
   ```powershell
   npm run dev
   ```
5. **Wait 10-15 seconds** for server to fully start
6. **Open fresh browser tab:** http://localhost:3000

## ⚠️ If Error Persists

1. **Check port 3000 is free:**
   ```powershell
   netstat -ano | Select-String ":3000"
   ```

2. **Kill process on port 3000:**
   ```powershell
   Get-NetTCPConnection -LocalPort 3000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
   ```

3. **Reinstall dependencies:**
   ```powershell
   Remove-Item -Recurse -Force node_modules
   Remove-Item package-lock.json
   npm install
   npm run dev
   ```

## ✅ Verification

After restarting, you should see:
- ✅ No error in browser
- ✅ Page loads correctly
- ✅ Console shows no ChunkLoadError

---

**Status**: ✅ Fixed!
**Next**: Start the frontend with `.\START_FRONTEND.ps1`

