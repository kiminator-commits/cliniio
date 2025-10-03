# 🚀 Supabase Setup Guide for Cliniio

This guide will walk you through setting up Supabase for your Cliniio application, including database setup, authentication, and real-time features.

## 📋 Prerequisites

- A Supabase account (free tier available)
- Node.js and npm installed
- Git repository access

## 🎯 Step 1: Create a Supabase Project

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Click "New Project"**
3. **Fill in project details:**
   - Organization: Select your organization
   - Name: `cliniio-db` (or your preferred name)
   - Database Password: Create a strong password
   - Region: Choose closest to your users
4. **Click "Create new project"**

## 🔧 Step 2: Get Your Project Credentials

1. **Go to Settings → API**
2. **Copy the following values:**
   - Project URL
   - Anon (public) key
   - Service role key (keep this secret!)

## 🌍 Step 3: Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Optional: Service role key for admin operations
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**⚠️ Important:** Never commit the service role key to version control!

## 🗄️ Step 4: Set Up Database Schema

### Option A: Using Supabase Dashboard (Recommended for beginners)

1. **Go to SQL Editor in your Supabase dashboard**
2. **Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`**
3. **Click "Run" to execute the migration**

### Option B: Using Supabase CLI (Advanced)

1. **Install Supabase CLI:**

   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase:**

   ```bash
   supabase login
   ```

3. **Link your project:**

   ```bash
   supabase link --project-ref your_project_ref
   ```

4. **Run the migration:**
   ```bash
   supabase db push
   ```

## 🔐 Step 5: Configure Authentication

1. **Go to Authentication → Settings**
2. **Configure the following:**

   **Site URL:**

   ```
   http://localhost:3001 (for development)
   https://your-domain.com (for production)
   ```

   **Redirect URLs:**

   ```
   http://localhost:3001/auth/callback
   http://localhost:3001/reset-password
   https://your-domain.com/auth/callback
   https://your-domain.com/reset-password
   ```

3. **Enable Email Auth:**
   - Go to Authentication → Providers
   - Enable "Email" provider
   - Configure email templates if needed

4. **Enable Security Features:**
   - Go to Authentication → Settings
   - Enable "Leaked Password Protection" (checks against HaveIBeenPwned.org)
   - Set minimum password length to 8 characters
   - Enable password requirements (letters, digits, symbols)

## 🎨 Step 6: Set Up Storage (Optional)

1. **Go to Storage in your Supabase dashboard**
2. **Create the following buckets:**
   - `avatars` (for user profile pictures)
   - `documents` (for PDFs and documents)
   - `images` (for general images)

3. **Set bucket policies:**

   ```sql
   -- Allow authenticated users to upload avatars
   CREATE POLICY "Users can upload avatars" ON storage.objects
   FOR INSERT WITH CHECK (
     bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
   );

   -- Allow users to view avatars
   CREATE POLICY "Users can view avatars" ON storage.objects
   FOR SELECT USING (bucket_id = 'avatars');

   -- Allow users to update their own avatars
   CREATE POLICY "Users can update avatars" ON storage.objects
   FOR UPDATE USING (
     bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

## 🔄 Step 7: Test the Connection

1. **Start your development server:**

   ```bash
   npm run dev
   ```

2. **Check the browser console for any Supabase connection errors**

3. **Test authentication:**
   - Try to sign up with a new account
   - Verify the user appears in the `users` table

## 🚀 Step 8: Enable Real-time Features

1. **Go to Database → Replication**
2. **Enable real-time for the following tables:**
   - `inventory_items`
   - `sterilization_cycles`
   - `environmental_cleans`
   - `knowledge_hub_content`

## 📊 Step 9: Set Up Row Level Security (RLS)

The migration script automatically sets up RLS policies, but you can verify them:

1. **Go to Authentication → Policies**
2. **Verify the following policies exist:**
   - Users can only access their own data
   - Inventory items are viewable by all but editable by owners
   - Audit logs are immutable

## 🔧 Step 10: Configure Your Application

### Update Inventory Configuration

In your inventory configuration, set Supabase as the default adapter:

```typescript
// src/config/inventoryConfig.ts
export const INVENTORY_CONFIG = {
  defaultAdapter: 'supabase',
  adapters: {
    supabase: {
      type: 'supabase',
      endpoint: process.env.VITE_SUPABASE_URL,
      apiKey: process.env.VITE_SUPABASE_ANON_KEY,
    },
  },
};
```

### Test the Integration

1. **Create a test inventory item**
2. **Verify it appears in the Supabase dashboard**
3. **Test real-time updates by opening multiple browser tabs**

## 🛠️ Troubleshooting

### Common Issues

**1. "Missing VITE_SUPABASE_URL" error**

- Check your `.env.local` file
- Ensure the environment variables are properly set
- Restart your development server

**2. "RLS policy violation" error**

- Verify the user is authenticated
- Check that the RLS policies are correctly set up
- Ensure the user has the correct permissions

**3. Real-time not working**

- Check that real-time is enabled for the table
- Verify the subscription is properly set up
- Check browser console for connection errors

**4. Authentication not working**

- Verify the redirect URLs are correct
- Check that email auth is enabled
- Ensure the site URL is properly configured

### Debug Mode

Enable debug logging by adding to your `.env.local`:

```bash
VITE_SUPABASE_DEBUG=true
```

## 🔒 Security Best Practices

1. **Never expose the service role key**
2. **Use RLS policies for all tables**
3. **Validate input data on both client and server**
4. **Use HTTPS in production**
5. **Regularly audit your database access**

## 📈 Performance Optimization

1. **Add indexes for frequently queried columns**
2. **Use pagination for large datasets**
3. **Optimize real-time subscriptions**
4. **Monitor query performance in the dashboard**

## 🚀 Deployment

### Vercel/Netlify

1. **Add environment variables to your deployment platform**
2. **Update site URLs in Supabase dashboard**
3. **Test the production deployment**

### Self-hosted

1. **Set up your own Supabase instance**
2. **Update environment variables**
3. **Configure your domain**

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)

## 🆘 Support

If you encounter issues:

1. **Check the Supabase dashboard logs**
2. **Review the browser console for errors**
3. **Consult the Supabase documentation**
4. **Join the Supabase Discord community**

---

**🎉 Congratulations!** Your Cliniio application is now connected to Supabase with a robust, scalable backend ready for production use.
