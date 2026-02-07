# Railway Setup - Quick Fix

## Internal Server Error = Missing Environment Variables

Your app is deployed but needs:

### 1. PostgreSQL Database (Required)

**Add PostgreSQL service to Railway:**

1. Go to your Railway project
2. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
3. Railway will auto-generate `DATABASE_URL` variable
4. Wait ~30 seconds for database to provision
5. App will auto-restart with database connected

### 2. Cloudflare R2 Storage (Required for uploads)

**Create R2 bucket:**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **R2 Object Storage**
3. Click **"Create bucket"**
   - Name: `construction-estimator-uploads`
   - Location: Automatic
4. Click **"Manage R2 API Tokens"**
5. **"Create API Token"**
   - Name: `construction-estimator-api`
   - Permissions: **Object Read & Write**
   - Apply to bucket: `construction-estimator-uploads`
6. **Copy these values** (shown once):
   - Access Key ID
   - Secret Access Key
   - Endpoint (format: `https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com`)

**Add to Railway Variables:**

```
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_here
R2_SECRET_ACCESS_KEY=your_secret_key_here
R2_BUCKET_NAME=construction-estimator-uploads
R2_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://pub-YOUR_ID.r2.dev
NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-YOUR_ID.r2.dev
```

(Get R2_PUBLIC_URL from bucket settings → Public access)

### 3. Run Database Migrations

**After DATABASE_URL is added:**

Option A (Railway CLI):
```bash
railway run npx prisma db push
railway run npm run db:seed
```

Option B (One-off container in Railway dashboard):
1. Go to your service
2. Click **"Settings"** → **"Run one-off"**
3. Command: `npx prisma db push && npm run db:seed`

---

## Quick Test Order

1. **Add PostgreSQL** (1 minute)
   - Railway auto-connects it
   - App restarts automatically

2. **Run migrations** (1 minute)
   - Creates all tables
   - Seeds 25 industry rates

3. **Test homepage** - Should load
   - Visit your Railway URL
   - Click "Get Started"
   - Should see projects page

4. **Add R2 later** (5 minutes)
   - Only needed when you actually upload files
   - Can create projects without it

---

## What Each Variable Does

**DATABASE_URL** - PostgreSQL connection string
- Required for: Everything (projects, files, quantities)
- Auto-added when you provision PostgreSQL service

**R2_*** - Cloudflare R2 storage credentials
- Required for: File uploads (PDFs, images)
- Without it: Can create projects, but can't upload files

---

## Current Status

Without DATABASE_URL:
- ❌ `/projects` → Internal Server Error (can't query database)
- ❌ `/api/projects` → 500 error

With DATABASE_URL:
- ✅ `/projects` → Works (empty list)
- ✅ Create project → Works
- ❌ Upload files → 500 error (needs R2)

With DATABASE_URL + R2:
- ✅ Everything works

---

## Fastest Path to Working App

**Step 1: Add PostgreSQL (30 seconds)**
```
Railway Dashboard → + New → Database → PostgreSQL
```

**Step 2: Run migrations (in Railway dashboard)**
```
Settings → Run one-off → Command: npx prisma db push && npm run db:seed
```

**Step 3: Test**
```
Visit your-app.railway.app/projects
Should see: "No projects yet" (success!)
Click "Create Project" → Should work
```

**Step 4: Add R2 later when you need uploads**

---

Done! That's all you need to fix the Internal Server Error.
