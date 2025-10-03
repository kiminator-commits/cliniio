# 🏪 Inventory Supabase Connection Setup Guide

This guide will help you set up and test the Supabase connection for the Inventory module in Cliniio.

## 📋 Prerequisites

- ✅ Supabase project created
- ✅ Database migrations run (`004_inventory_module.sql`)
- ✅ Environment variables configured
- ✅ Node.js and npm installed

## 🚀 Quick Setup

### 1. Environment Variables

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://psqwgebhxfuzqqgdzcmm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzcXdnZWJoeGZ1enFxZ2R6Y21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2ODAzNDIsImV4cCI6MjA2NDI1NjM0Mn0.fIXLOK-TsgDtFo4Y483v4xVUH8msaESJm8_2rLw5sys

# Debug mode for development
VITE_SUPABASE_DEBUG=true
```

### 2. Run Database Migrations

```bash
# Push migrations to Supabase
npx supabase db push

# Or run specific migration
npx supabase db push --include-all
```

### 3. Test the Connection

```bash
# Run the test script
npx tsx scripts/testInventorySupabase.ts
```

## 🧪 Testing the Connection

### Option 1: Command Line Test

Run the comprehensive test script:

```bash
npx tsx scripts/testInventorySupabase.ts
```

This will test:

- ✅ Supabase configuration
- ✅ Database connection
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Category and location retrieval
- ✅ Analytics functionality
- ✅ Real-time subscriptions

### Option 2: Browser Test

Add the test component to your inventory page:

```tsx
import InventorySupabaseConnectionTest from '@/components/Inventory/SupabaseConnectionTest';

// Add to your inventory page
<InventorySupabaseConnectionTest />;
```

### Option 3: Manual Testing

1. **Start the development server:**

   ```bash
   npm run dev
   ```

2. **Navigate to the Inventory page**

3. **Check browser console for connection logs**

4. **Try creating/editing inventory items**

## 🔧 Configuration Files

### Inventory Configuration (`src/config/inventoryConfig.ts`)

The system automatically configures:

- **Default adapter**: Supabase
- **Table names**: Mapped to Supabase tables
- **Cache settings**: 5-minute TTL
- **Real-time**: Enabled when Supabase is configured
- **Error handling**: Graceful fallbacks

### Supabase Service (`src/services/inventory/services/inventorySupabaseService.ts`)

Provides:

- **Connection testing**: Automatic connection validation
- **CRUD operations**: Full item management
- **Real-time subscriptions**: Live updates
- **Error handling**: Comprehensive error management
- **Analytics**: Inventory statistics

## 📊 Database Schema

The inventory module uses these Supabase tables:

### Core Tables

- `inventory_items` - Main inventory items
- `inventory_transactions` - Item movement history
- `inventory_suppliers` - Supplier information
- `inventory_categories` - Category management
- `inventory_audits` - Audit records
- `inventory_alerts` - System alerts
- `inventory_reports` - Generated reports

### Key Features

- **Row Level Security (RLS)**: Facility-based access control
- **Triggers**: Automatic quantity updates and alerts
- **Indexes**: Optimized for performance
- **JSONB fields**: Flexible metadata storage

## 🔒 Security

### Row Level Security Policies

All tables have RLS enabled with policies that:

- **Allow read access** to users in the same facility
- **Allow write access** to authenticated users
- **Prevent cross-facility access**
- **Audit all changes**

### Data Protection

- **Encryption**: All data encrypted at rest
- **Backups**: Automatic daily backups
- **Access Control**: Role-based permissions
- **Audit Trails**: Complete change tracking

## 🚨 Troubleshooting

### Common Issues

#### 1. "Supabase not configured" Error

**Symptoms:**

- Error message about missing environment variables
- System falls back to static data

**Solutions:**

```bash
# Check environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Restart development server
npm run dev
```

#### 2. "Connection failed" Error

**Symptoms:**

- Connection test fails
- Database queries return errors

**Solutions:**

```bash
# Check Supabase project status
# Verify migrations are applied
npx supabase db push

# Test connection manually
npx tsx scripts/testInventorySupabase.ts
```

#### 3. "RLS policy violation" Error

**Symptoms:**

- Database operations fail with policy errors
- Users can't access data

**Solutions:**

- Verify user authentication
- Check facility assignment
- Review RLS policies in Supabase dashboard

#### 4. "Real-time not working" Error

**Symptoms:**

- No live updates
- Subscription errors

**Solutions:**

- Check real-time is enabled in Supabase
- Verify WebSocket connectivity
- Check browser console for errors

### Debug Mode

Enable detailed logging:

```bash
# Add to .env.local
VITE_SUPABASE_DEBUG=true
```

This will show:

- Connection attempts
- Query details
- Error information
- Performance metrics

## 📈 Performance Optimization

### Caching Strategy

- **Client-side cache**: 5-minute TTL for inventory data
- **Connection pooling**: Reuse database connections
- **Query optimization**: Indexed fields for fast searches

### Best Practices

1. **Use filters**: Always filter by facility_id
2. **Limit results**: Use pagination for large datasets
3. **Batch operations**: Group multiple updates
4. **Monitor performance**: Check query execution times

## 🔄 Real-time Features

### Live Updates

The inventory system supports real-time updates for:

- **Item creation**: New items appear instantly
- **Item updates**: Changes reflect immediately
- **Item deletion**: Removed items disappear
- **Quantity changes**: Stock levels update live

### Subscription Management

```typescript
// Subscribe to changes
const unsubscribe = inventorySupabaseService.subscribeToChanges((payload) => {
  console.log('Inventory changed:', payload);
});

// Clean up subscription
unsubscribe();
```

## 📱 Integration with UI

### Automatic Fallback

The system automatically:

- **Tries Supabase first** when configured
- **Falls back to static data** when Supabase is unavailable
- **Shows appropriate UI states** (loading, error, success)
- **Handles errors gracefully** with user-friendly messages

### UI Components

- **Connection status indicator**: Shows Supabase status
- **Loading states**: Spinners during data operations
- **Error boundaries**: Graceful error handling
- **Success notifications**: Confirm successful operations

## 🎯 Next Steps

After setup:

1. **Test all CRUD operations**
2. **Verify real-time updates**
3. **Check analytics functionality**
4. **Test error scenarios**
5. **Monitor performance**

## 📞 Support

If you encounter issues:

1. **Check the troubleshooting section**
2. **Run the test script**
3. **Review browser console logs**
4. **Check Supabase dashboard**
5. **Verify environment variables**

## ✅ Verification Checklist

- [ ] Environment variables set correctly
- [ ] Database migrations applied
- [ ] Connection test passes
- [ ] CRUD operations work
- [ ] Real-time subscriptions active
- [ ] Analytics functioning
- [ ] Error handling works
- [ ] Performance acceptable
- [ ] Security policies applied
- [ ] Backup strategy in place

---

**🎉 Congratulations!** Your inventory module is now fully connected to Supabase with real-time capabilities, comprehensive error handling, and production-ready performance.
