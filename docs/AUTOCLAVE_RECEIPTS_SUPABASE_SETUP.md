# Autoclave Receipts Supabase Setup Guide

This guide will help you set up the Supabase backend for autoclave receipt uploads.

## 📋 Prerequisites

- Supabase project already configured
- Environment variables set up (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY)
- Supabase CLI installed (optional but recommended)

## 🗄️ Database Setup

The autoclave receipts table is already created in migration `011_autoclave_receipts.sql`. If you haven't run it yet:

### Option A: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration: `supabase/migrations/011_autoclave_receipts.sql`

### Option B: Using Supabase CLI

```bash
supabase db push
```

## 📦 Storage Bucket Setup

### Step 1: Create Storage Bucket

Run the storage migration: `supabase/migrations/014_autoclave_receipts_storage.sql`

This will:

- Create the `autoclave-receipts` storage bucket
- Set file size limit to 10MB
- Allow image file types (JPEG, PNG, WebP)
- Configure RLS policies for authenticated users

### Step 2: Verify Storage Bucket

1. Go to Storage in your Supabase dashboard
2. Verify the `autoclave-receipts` bucket exists
3. Check that the policies are applied

## 🔐 Storage Policies

The migration creates the following policies:

- **Upload**: Authenticated users can upload receipt photos
- **View**: Authenticated users can view receipt photos
- **Update**: Authenticated users can update receipt photos
- **Delete**: Authenticated users can delete receipt photos

## 🧪 Testing the Setup

### Test File Upload

1. Start your development server: `npm run dev`
2. Navigate to the Sterilization workflow
3. Try uploading an autoclave receipt
4. Check the Supabase Storage dashboard to verify the file was uploaded
5. Check the `autoclave_receipts` table to verify the metadata was saved

### Test File Retrieval

1. Upload a receipt
2. Try viewing the receipt in the AutoclaveReceiptViewer
3. Verify the image loads correctly

## 🔧 Configuration Options

### File Size Limits

The default file size limit is 10MB. To change this:

1. Go to Storage in Supabase dashboard
2. Click on the `autoclave-receipts` bucket
3. Edit the file size limit

### Retention Period

The default retention period is 12 months. To change this:

1. Update the `facility_settings` table
2. Set `receipt_retention_months` to your desired value

### Allowed File Types

Currently allowed: JPEG, JPG, PNG, WebP

To modify allowed types, update the migration file and re-run it.

## 🧹 Cleanup Functions

The setup includes automatic cleanup functions:

### Expired Receipts

- Function: `mark_expired_receipts()`
- Automatically marks receipts as expired when retention period is reached
- Can be scheduled with pg_cron (requires extension)

### Orphaned Files

- Function: `cleanup_orphaned_receipt_files()`
- Removes files from storage that don't have corresponding database records
- Can be scheduled with pg_cron (requires extension)

## 🚨 Troubleshooting

### "Storage bucket not found" error

1. Verify the storage bucket was created
2. Check the bucket name matches exactly: `autoclave-receipts`
3. Ensure you're authenticated

### "Permission denied" error

1. Check that RLS policies are applied
2. Verify the user is authenticated
3. Check the storage bucket permissions

### "File too large" error

1. Check the file size limit in the storage bucket settings
2. Ensure the file is under 10MB (or your configured limit)

### "Invalid file type" error

1. Check that the file is an allowed image type
2. Verify the file extension is correct

## 📊 Monitoring

### Storage Usage

Monitor storage usage in the Supabase dashboard:

1. Go to Storage
2. Check the `autoclave-receipts` bucket usage
3. Set up alerts for storage limits

### Database Performance

Monitor the `autoclave_receipts` table:

1. Check query performance
2. Monitor index usage
3. Set up alerts for table size

## 🔒 Security Considerations

1. **File Validation**: Always validate file types on the client and server
2. **Size Limits**: Enforce file size limits to prevent abuse
3. **Access Control**: Only authenticated users can access receipts
4. **Retention**: Automatically clean up expired receipts
5. **Audit Trail**: All uploads are logged with user information

## 📝 Environment Variables

Ensure these are set in your `.env.local`:

```bash
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## ✅ Verification Checklist

- [ ] Database table `autoclave_receipts` exists
- [ ] Storage bucket `autoclave-receipts` exists
- [ ] RLS policies are applied
- [ ] File upload works
- [ ] File retrieval works
- [ ] Metadata is saved correctly
- [ ] Cleanup functions are available
- [ ] Environment variables are configured
