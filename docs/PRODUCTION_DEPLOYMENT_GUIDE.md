# Production Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Cliniio sterilization system to production with Supabase.

## Pre-Deployment Checklist

### ✅ Database Schema Validation

- [ ] All migration files are clean (duplicates removed)
- [ ] UUID generation standardized to `gen_random_uuid()`
- [ ] Foreign key relationships verified
- [ ] Indexes optimized for performance
- [ ] RLS policies configured correctly

### ✅ Security Review

- [ ] Row Level Security (RLS) enabled on all tables
- [ ] Audit logging configured
- [ ] User permissions properly set
- [ ] API keys secured

### ✅ Performance Optimization

- [ ] Database indexes created
- [ ] JSONB compression enabled
- [ ] Query optimization completed
- [ ] Monitoring functions deployed

## Deployment Steps

### Step 1: Backup Current Database

```bash
# Create a backup before deployment
npx supabase db dump --project-ref psqwgebhxfuzqqgdzcmm > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Deploy Migrations

```bash
# Deploy all migrations in order
npx supabase db push --project-ref psqwgebhxfuzqqgdzcmm
```

### Step 3: Verify Deployment

```bash
# Check migration status
npx supabase migration list --project-ref psqwgebhxfuzqqgdzcmm

# Verify all tables exist
npx supabase db diff --project-ref psqwgebhxfuzqqgdzcmm
```

### Step 4: Run Production Cleanup

```sql
-- Execute the production cleanup migration
-- This will standardize UUID generation and add monitoring
-- Run this in Supabase SQL Editor
```

### Step 5: Test Core Functionality

- [ ] Tool scanning and movement
- [ ] Sterilization workflows
- [ ] File uploads (autoclave receipts)
- [ ] Real-time updates
- [ ] Audit logging

## Production Monitoring

### Database Health Checks

```sql
-- Monitor table sizes
SELECT * FROM get_table_sizes();

-- Check for slow queries
SELECT * FROM get_slow_queries();

-- Verify data integrity
SELECT validate_sterilization_tool('tool-uuid-here');
```

### Key Metrics to Monitor

- **Database Performance**: Query response times, connection pool usage
- **Storage Usage**: Table sizes, growth rates
- **Error Rates**: Failed operations, constraint violations
- **User Activity**: Concurrent users, peak usage times

## Rollback Procedures

### Emergency Rollback

```bash
# If deployment fails, restore from backup
npx supabase db reset --project-ref psqwgebhxfuzqqgdzcmm
# Then restore from backup file
```

### Partial Rollback

```sql
-- If specific migration fails, you can manually revert
-- Example: Drop problematic tables and recreate
DROP TABLE IF EXISTS problematic_table CASCADE;
-- Then re-run the specific migration
```

## Post-Deployment Verification

### 1. Data Integrity Check

```sql
-- Verify all tables have proper constraints
SELECT
    table_name,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
ORDER BY table_name, constraint_type;
```

### 2. Performance Baseline

```sql
-- Establish performance baselines
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 3. Security Verification

```sql
-- Verify RLS is enabled on all tables
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

## Production Configuration

### Environment Variables

```bash
# Required environment variables for production
NEXT_PUBLIC_SUPABASE_URL=https://psqwgebhxfuzqqgdzcmm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Supabase Settings

- **Database**: Enable connection pooling
- **Storage**: Configure bucket policies
- **Auth**: Set up email confirmations
- **Edge Functions**: Deploy if needed

## Troubleshooting

### Common Issues

#### 1. Migration Conflicts

```sql
-- Check for conflicting migrations
SELECT * FROM supabase_migrations.schema_migrations
ORDER BY version;
```

#### 2. Performance Issues

```sql
-- Identify slow queries
SELECT * FROM get_slow_queries();

-- Check index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

#### 3. Storage Issues

```sql
-- Monitor storage growth
SELECT * FROM get_table_sizes();

-- Check for large JSONB columns
SELECT
    table_name,
    column_name,
    pg_size_pretty(pg_column_size(column_name::text)) as size
FROM information_schema.columns
WHERE data_type = 'jsonb'
AND table_schema = 'public';
```

## Maintenance Schedule

### Daily

- [ ] Monitor error logs
- [ ] Check database performance
- [ ] Verify backup completion

### Weekly

- [ ] Review slow query reports
- [ ] Analyze storage growth
- [ ] Update monitoring dashboards

### Monthly

- [ ] Performance optimization review
- [ ] Security audit
- [ ] Capacity planning

## Support Contacts

- **Database Issues**: Supabase Support
- **Application Issues**: Development Team
- **Infrastructure**: DevOps Team

## Emergency Contacts

- **Database Emergency**: [Emergency Contact]
- **Application Emergency**: [Emergency Contact]
- **Infrastructure Emergency**: [Emergency Contact]

---

**Last Updated**: [Date]
**Version**: 1.0
**Author**: Development Team
