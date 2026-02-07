# Deployment Guide

## Quick Deploy to Railway

### GitHub Integration (Recommended)

**Repository:** https://github.com/nocodebrain/construction-estimator-ai

1. **Deploy on Railway:**
   - Visit https://railway.app/new
   - Click "Deploy from GitHub repo"
   - Select `nocodebrain/construction-estimator-ai`
   - Railway will auto-detect Next.js and deploy

2. **Build Process (Automatic):**
   - Nixpacks detects Node.js 20
   - Runs: `npm install`
   - Runs: `npm run build`
   - Starts: `npm start`

3. **Get Live URL:**
   - Railway provides: `construction-estimator-ai.up.railway.app`
   - Or configure custom domain in settings

4. **Configure Environment Variables (optional for now):**
```
AI_SERVICE_URL=http://localhost:8000  # Will add later
```

### Railway CLI Alternative

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# In project directory
cd /data/.openclaw/workspace/construction-estimator-ai

# Initialize and deploy
railway init
railway up
```

## Manual Deployment / Local Testing

### Build Locally
```bash
cd /data/.openclaw/workspace/construction-estimator-ai
npm install
npm run build
npm start
```

Visit: http://localhost:3000

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
