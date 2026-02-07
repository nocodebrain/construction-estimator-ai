# Deployment Guide

## Quick Deploy to Railway

### Option 1: GitHub Integration (Recommended)

1. **Push to GitHub:**
```bash
# If not already done, create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/construction-estimator-ai.git
git push -u origin main
```

2. **Deploy on Railway:**
- Visit https://railway.app
- Click "New Project" → "Deploy from GitHub repo"
- Select your `construction-estimator-ai` repo
- Railway will auto-detect Next.js and deploy

3. **Configure Environment Variables (optional for now):**
```
AI_SERVICE_URL=http://localhost:8000  # Will add later
```

### Option 2: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

## Manual Deployment

### Build Locally
```bash
cd web
npm install
npm run build
npm start
```

### Production Checklist
- [ ] Environment variables configured
- [ ] Database connected (coming Day 3)
- [ ] File storage configured (coming Day 2)
- [ ] AI service deployed (coming Day 3)

## Current Status

**Day 2:** Upload UI ready, storage integration pending
**Live URL:** Will be added after first Railway deploy

## Next Steps

1. Deploy to Railway
2. Add Cloudflare R2 storage
3. Connect AI service
4. Add database (PostgreSQL)
