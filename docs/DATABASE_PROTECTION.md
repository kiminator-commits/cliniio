# Database Protection System

## 🚨 CRITICAL: Database Safety Measures

**YOUR DATABASE WAS ACCIDENTALLY DELETED YESTERDAY - THESE MEASURES PREVENT IT FROM HAPPENING AGAIN**

## 🛡️ Protection Features

### 1. Safe Database Commands

**❌ NEVER USE THESE DANGEROUS COMMANDS:**

```bash
# These commands will DELETE your database
npx supabase db reset
npx supabase db reset --linked
npx supabase db reset --yes
```

**✅ USE THESE SAFE ALTERNATIVES:**

```bash
# Create backup before any operation
npm run db:backup

# Reset with confirmation and backup
npm run db:reset:safe

# Restore from backup if needed
npm run db:restore

# Check protection status
npm run db:status
```

### 2. Automatic Backup System

- **Before Reset**: Automatic backup created before any reset operation
- **Backup Location**: `./database-backups/`
- **Backup Naming**: `emergency_backup_YYYY-MM-DDTHH-mm-ss.sql`
- **Retention**: Keep at least 5 recent backups

### 3. Confirmation Requirements

- **Production Environment**: Extra confirmation required
- **Confirmation Text**: Must type "DELETE DATABASE" exactly
- **Environment Variables**: Must be properly configured
- **Backup Verification**: Backup must be created successfully

## 🚨 Emergency Procedures

### If Database is Accidentally Reset

1. **STOP** all development work immediately
2. **Check** for recent backups:
   ```bash
   npm run db:status
   ```
3. **Restore** from most recent backup:
   ```bash
   npm run db:restore
   ```
4. **Verify** data integrity after restore

### If No Backup Exists

1. **Check** Supabase dashboard for automatic backups
2. **Contact** Supabase support for recovery options
3. **Review** migration files to rebuild schema
4. **Restore** from production data if available

## 🔧 Configuration

### Environment Variables Required

```bash
# .env.local
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Protection Settings

```javascript
// scripts/database-protection.js
const PROTECTION_CONFIG = {
  CONFIRMATION_REQUIRED: true,
  BACKUP_BEFORE_RESET: true,
  PROTECTED_COMMANDS: [
    'supabase db reset',
    'npx supabase db reset',
    'supabase db reset --linked',
    'npx supabase db reset --linked',
    'supabase db reset --yes',
    'npx supabase db reset --yes',
  ],
};
```

## 📋 Daily Safety Checklist

### Before Any Database Operations

- [ ] Run `npm run db:backup` to create backup
- [ ] Check `npm run db:status` for protection status
- [ ] Verify environment variables are set
- [ ] Confirm you're in the correct environment (dev/prod)

### After Database Operations

- [ ] Verify data integrity
- [ ] Test critical functionality
- [ ] Check audit logs are working
- [ ] Confirm RLS policies are active

## 🚫 Prohibited Actions

### Never Do These

1. **Direct Reset Commands**: Never run `supabase db reset` directly
2. **Skip Confirmations**: Always use the safe wrapper commands
3. **Production Resets**: Never reset production database
4. **Skip Backups**: Always create backup before major operations
5. **Ignore Warnings**: Pay attention to all safety warnings

### Always Do These

1. **Use Safe Commands**: Always use `npm run db:*` commands
2. **Create Backups**: Before any destructive operation
3. **Verify Environment**: Check you're in the right environment
4. **Test After Changes**: Verify functionality after database changes
5. **Monitor Logs**: Watch for any error messages

## 🔍 Monitoring

### Check Protection Status

```bash
npm run db:status
```

This shows:

- Environment (development/production)
- Backup directory status
- Recent backups available
- Protection configuration

### Monitor Database Health

```bash
# Check Supabase dashboard
# Monitor connection limits
# Watch for RLS policy violations
# Review audit logs
```

## 🆘 Emergency Contacts

### If Database is Lost

1. **Immediate**: Check `./database-backups/` for recent backups
2. **Supabase Dashboard**: Look for automatic backups
3. **Support**: Contact Supabase support for recovery
4. **Team**: Notify team members immediately

### Recovery Steps

1. **Stop** all development work
2. **Assess** damage and available backups
3. **Restore** from most recent backup
4. **Verify** data integrity
5. **Test** critical functionality
6. **Document** what happened and how it was fixed

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Database Backup Best Practices](https://supabase.com/docs/guides/database/backups)
- [RLS Policy Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Migration Management](https://supabase.com/docs/guides/database/migrations)

## ⚠️ Remember

**YOUR DATABASE WAS DELETED ONCE - DON'T LET IT HAPPEN AGAIN**

- Always use safe commands
- Always create backups
- Always verify before proceeding
- Always test after changes
- Always monitor for issues

**When in doubt, ask for help before proceeding with any database operations.**
