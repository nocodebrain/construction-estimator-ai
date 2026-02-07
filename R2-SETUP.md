# Cloudflare R2 Setup Guide

## What is R2?

Cloudflare R2 is an S3-compatible object storage service. Perfect for storing uploaded files (PDFs, images, Excel, etc.) with zero egress fees.

## Setup Steps

### 1. Create R2 Bucket

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **R2** in the sidebar
3. Click **Create bucket**
4. Bucket name: `construction-estimator-uploads` (or your choice)
5. Location: Choose closest to your users (e.g., **Automatic** for global)
6. Click **Create bucket**

### 2. Get API Credentials

1. In R2 dashboard, click **Manage R2 API Tokens**
2. Click **Create API Token**
3. Give it a name: `construction-estimator-api`
4. Permissions:
   - **Object Read & Write**
   - Apply to specific bucket: `construction-estimator-uploads`
5. Click **Create API Token**
6. **Copy the credentials** (shown once):
   - Access Key ID
   - Secret Access Key
   - Endpoint URL (format: `https://<account-id>.r2.cloudflarestorage.com`)

### 3. Configure Public Access (Optional)

If you want files to be publicly accessible via direct URLs:

1. Go to your bucket settings
2. Enable **Public access**
3. Set up a custom domain (or use R2's default domain)
4. Note the public URL (e.g., `https://pub-xyz.r2.dev`)

**Alternative:** Use presigned URLs (already implemented in `/lib/r2.ts`)

### 4. Add Environment Variables to Railway

In your Railway project:

1. Go to **Variables** tab
2. Add the following:

```bash
R2_ACCOUNT_ID=your-account-id-here
R2_ACCESS_KEY_ID=your-access-key-id-here
R2_SECRET_ACCESS_KEY=your-secret-access-key-here
R2_BUCKET_NAME=construction-estimator-uploads
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://your-custom-domain.com

# Public variable (for frontend)
NEXT_PUBLIC_R2_PUBLIC_URL=https://your-custom-domain.com
```

3. Railway will automatically redeploy with new env vars

### 5. Test Upload

1. Visit your deployed app: `https://your-app.railway.app/upload`
2. Drag & drop a PDF or image
3. Click "Upload"
4. Should see success message + file appears in "Uploaded Files" section

### 6. Verify in Cloudflare

1. Go to your R2 bucket in Cloudflare dashboard
2. Navigate into `uploads/` folder
3. Should see your uploaded files

## Pricing

**Free Tier:**
- 10 GB storage
- 1 million Class A operations/month (writes)
- 10 million Class B operations/month (reads)
- Zero egress fees (forever!)

**Beyond Free Tier:**
- Storage: $0.015/GB/month
- Class A ops: $4.50/million
- Class B ops: $0.36/million

**For this app:** Free tier covers ~100-200 projects/month easily.

## Troubleshooting

### "Unauthorized" errors
- Double-check your credentials
- Ensure API token has correct permissions
- Verify bucket name matches

### Files not showing up
- Check R2 bucket directly in Cloudflare dashboard
- Verify `R2_BUCKET_NAME` env var
- Check Railway logs for upload errors

### Public URLs not working
- Ensure public access is enabled on bucket
- Or use presigned URLs (already implemented)

## Security Notes

- Never commit R2 credentials to Git
- Use Railway environment variables (or `.env.local` for local dev)
- Consider presigned URLs instead of public bucket (more secure)
- Add file size limits (currently 50MB max)
- Validate file types (already implemented)

## What's Built

### API Routes
- `POST /api/upload` - Upload file to R2
- `GET /api/files` - List all uploaded files
- `DELETE /api/files/[key]` - Delete file from R2

### Client Features
- Drag-and-drop upload (react-dropzone)
- Real-time upload progress
- File type validation (PDF, Excel, Word, Images)
- File size limit (50MB)
- View uploaded files
- Delete files
- Automatic refresh after upload

### R2 Integration (`/lib/r2.ts`)
- S3-compatible client (@aws-sdk/client-s3)
- Upload with unique filenames (UUID)
- List files in bucket
- Delete files
- Generate presigned URLs (1 hour expiry)

## Next Steps

Once R2 is configured:
1. ✅ Test upload/delete flow
2. Add thumbnail generation for PDFs (Day 3)
3. Store file metadata in database (Day 3)
4. Add file processing (AI analysis) (Day 3+)

---

**Status:** Ready to deploy! Just add R2 credentials to Railway env vars.
