# Deploy to Vercel Dashboard

## Step 1: Prepare Your Repository

1. Make sure all changes are committed and pushed to your Git repository
2. Ensure your repository is public or connected to Vercel

## Step 2: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository (GitHub, GitLab, or Bitbucket)
4. Vercel will auto-detect it's a Vite project

## Step 3: Configure Build Settings

- **Framework Preset**: Vite (should be auto-detected)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Step 4: Set Environment Variables

Add these in the Vercel dashboard:

- `VITE_SUPABASE_URL` = your_supabase_project_url
- `VITE_SUPABASE_ANON_KEY` = your_supabase_anon_key

## Step 5: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Check the deployment URL

## Troubleshooting

- If you get URL_TOO_LONG errors, the bundle analyzer has been removed
- If you get build errors, check the build logs in Vercel dashboard
- Ensure all environment variables are set correctly

## Alternative: Use Vercel CLI (if dashboard doesn't work)

```bash
# Login first
vercel login

# Deploy
vercel --prod
```
