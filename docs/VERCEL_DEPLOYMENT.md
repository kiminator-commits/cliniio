# Vercel Deployment Guide for Cliniio

## Prerequisites

- Vercel account
- Your Supabase project URL and anon key
- Git repository connected to Vercel

## Step 1: Deploy to Vercel

### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Configure build settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

## Step 2: Environment Variables

Set these environment variables in your Vercel project settings:

### Required Variables

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Optional Variables

```
VITE_APP_ENV=production
VITE_API_BASE_URL=your_api_url
# Note: All AI features now run on OpenAI GPT-4o (via GPT-4o-mini)
```

## Step 3: Configure Environment Variables in Vercel

1. Go to your project dashboard on Vercel
2. Navigate to Settings → Environment Variables
3. Add each variable:
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: Your Supabase project URL
   - **Environment**: Production, Preview, Development
4. Repeat for all required variables

## Step 4: Deploy

1. Push your changes to your Git repository
2. Vercel will automatically trigger a new deployment
3. Monitor the build logs for any issues

## Step 5: Verify Deployment

1. Check that your app loads correctly
2. Test Supabase connection
3. Verify all features work as expected

## Troubleshooting

### Build Errors

- Ensure all dependencies are in `package.json`
- Check that `vercel.json` is in the root directory
- Verify environment variables are set correctly

### Runtime Errors

- Check browser console for errors
- Verify Supabase connection
- Ensure all environment variables are accessible

### Environment Variables Not Working

- Make sure variables start with `VITE_`
- Check that variables are set for all environments
- Redeploy after adding new variables

## Configuration Files

The `vercel.json` file is already configured with:

- Build command: `npm run build`
- Output directory: `dist`
- Framework: Vite
- SPA routing configuration
- Asset caching headers

## Next Steps

After successful deployment:

1. Set up custom domain (optional)
2. Configure analytics
3. Set up monitoring
4. Test all features thoroughly
