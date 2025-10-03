# Supabase Database Schema

## Overview

This directory contains all database migrations for the Cliniio sterilization system. The schema is designed to support a comprehensive sterilization workflow management system with AI-ready data structures for analytics and forecasting.

## 🏗️ Schema Architecture

### Core Tables

| Table                              | Purpose                    | Key Features                                          |
| ---------------------------------- | -------------------------- | ----------------------------------------------------- |
| `sterilization_tools`              | Core tool management       | Barcode tracking, lifecycle management, AI insights   |
| `sterilization_batches`            | Batch processing           | Package management, cycle tracking                    |
| `sterilization_cycles`             | Cycle management           | Phase tracking, performance metrics                   |
| `bi_test_results`                  | Biological indicator tests | Compliance tracking, failure analysis                 |
| `autoclave_receipts`               | Document storage           | Image uploads, retention management                   |
| `environmental_cleans_enhanced`    | Environmental cleaning     | Room management, checklist tracking, quality metrics  |
| `environmental_cleaning_analytics` | Cleaning analytics         | Performance metrics, efficiency tracking              |
| `inventory_items`                  | Inventory management       | Equipment tracking, stock management, barcode support |
| `audit_logs`                       | Audit trails               | Complete change tracking, compliance monitoring       |

### AI-Ready Features

- **JSONB Fields**: Flexible data storage for analytics
- **Real-time Events**: Live data streaming capabilities
- **Performance Metrics**: Built-in monitoring and optimization
- **Audit Trails**: Complete compliance tracking
- **Risk Assessment**: AI-powered risk scoring

## 📁 Migration Files

### Core Schema (001-010)

- `001_initial_schema.sql` - Foundation tables and security
- `002_update_inventory_items_schema.sql` - Inventory enhancements
- `003_bi_workflow_schema.sql` - Biological indicator workflow
- `004_bi_failure_workflow_schema.sql` - Failure handling and quarantine
- `005_bi_patient_exposure_tracking.sql` - Patient safety tracking
- `008_sterilization_batches.sql` - Batch management system
- `009_batch_management_functions.sql` - Batch processing functions
- `010_sterilization_tools_schema.sql` - Core tool management

### File Storage (011-017)

- `011_autoclave_receipts.sql` - Receipt upload system
- `014_autoclave_receipts_storage.sql` - Storage bucket setup
- `015_verify_autoclave_storage.sql` - Storage verification
- `016_complete_autoclave_storage.sql` - Complete storage system
- `017_simple_autoclave_setup.sql` - Simplified storage setup

### AI Integration (018-021)

- `018_comprehensive_platform_schema.sql` - AI-ready schema with environmental cleaning
- `020_fix_foreign_key_relationships.sql` - Relationship fixes
- `021_production_cleanup.sql` - Production optimizations

### Security & Performance (006-013)

- `006_fix_patient_exposure_summary_security.sql` - Security fixes
- `007_fix_all_view_security.sql` - View security
- `013_fix_remaining_function_search_paths.sql` - Function security

### Inventory System (022-029)

The inventory system provides comprehensive medical equipment and supply management with real-time tracking, audit trails, and automated workflows.

**Core Features:**

- **Item Management**: Track medical equipment, supplies, and instruments with detailed metadata
- **Real-time Updates**: Live inventory changes with Supabase real-time subscriptions
- **Audit Trails**: Complete change tracking for compliance and accountability
- **Stock Management**: Min/max quantities, reorder points, and low stock alerts
- **Barcode Support**: Scan-based inventory operations
- **Category Organization**: Hierarchical categorization for easy filtering
- **Supplier Tracking**: Manufacturer and supplier information management

**Migration Files:**

- `022_inventory_security_fixes.sql` - Security fixes for inventory system
- `023_core_extensions_users.sql` - Core extensions and users table setup
- `024_core_inventory_table.sql` - Core inventory items table setup
- `025_enhanced_inventory_fields.sql` - Enhanced inventory fields (barcode, warranty, etc.)
- `026_audit_logs_table.sql` - Audit logs table for change tracking
- `027_triggers_functions.sql` - Triggers and functions for automatic updates
- `028_audit_function_triggers.sql` - Audit function and triggers setup
- `029_sample_data_final_setup.sql` - Sample data and final inventory setup

**Key Tables:**

- `inventory_items` - Main inventory table with comprehensive item data
- `audit_logs` - Complete audit trail for all inventory changes
- `users` - User management for inventory ownership and permissions

### Environmental Clean System (031-033)

The Environmental Clean system provides comprehensive room cleaning management with real-time tracking, checklist workflows, and compliance monitoring.

**Core Features:**

- **Room Management**: Track cleaning status, schedules, and quality metrics
- **Real-time Updates**: Live room status changes with Supabase real-time subscriptions
- **Checklist Workflows**: Structured cleaning procedures with completion tracking
- **Quality Metrics**: Compliance scoring and quality assessment
- **Barcode Scanning**: Room identification and status updates
- **Analytics Dashboard**: Performance metrics and cleaning efficiency
- **Audit Trails**: Complete cleaning history for compliance

**Migration Files:**

- `031_inventory_sterilization_sync.sql` - Synchronization between inventory and sterilization systems
- `032_environmental_clean_rooms.sql` - Sample room data for environmental cleaning
- `033_environmental_clean_checklists.sql` - Sample checklist data for cleaning workflows

**Key Tables:**

- `environmental_cleans_enhanced` - Main environmental cleaning table with comprehensive room data
- `environmental_cleaning_analytics` - Analytics view for cleaning performance metrics
- `audit_logs` - Audit trail for all cleaning activities

## 🚀 Quick Start

### Prerequisites

- Supabase CLI installed
- Project reference: `psqwgebhxfuzqqgdzcmm`
- Access to Supabase dashboard

### Local Development

```bash
# Link to your Supabase project
npx supabase link --project-ref psqwgebhxfuzqqgdzcmm

# Start local development
npx supabase start

# Apply migrations
npx supabase db push
```

### Production Deployment

```bash
# Deploy to production
npx supabase db push --project-ref psqwgebhxfuzqqgdzcmm

# Verify deployment
npx supabase migration list --project-ref psqwgebhxfuzqqgdzcmm
```

## 🔧 Development Workflow

### Creating New Migrations

```bash
# Generate new migration
npx supabase migration new migration_name

# Edit the generated file in supabase/migrations/
# Follow naming convention: XXX_description.sql
```

### Migration Best Practices

1. **Use IF NOT EXISTS** for table creation
2. **Include proper indexes** for performance
3. **Add RLS policies** for security
4. **Include rollback procedures** when possible
5. **Test migrations** in staging first

### Schema Changes

```sql
-- Example: Adding a new column
ALTER TABLE sterilization_tools
ADD COLUMN IF NOT EXISTS new_field VARCHAR(255);

-- Example: Creating an index
CREATE INDEX IF NOT EXISTS idx_tools_new_field
ON sterilization_tools(new_field);

-- Example: Adding RLS policy
CREATE POLICY "Users can view new field"
ON sterilization_tools FOR SELECT USING (true);
```

## 📊 Data Model

### Tool Lifecycle

```
Available → In Cycle → Bath 1 → Bath 2 → Drying → Autoclave → Complete
    ↓           ↓        ↓       ↓       ↓        ↓          ↓
  Scan      Add to    Timer   Timer   Timer    Timer     Update
  Tool      Batch    Start   Start   Start    Start     Status
```

### Batch Processing

```
Creating → Ready → In Autoclave → Completed
    ↓        ↓         ↓            ↓
  Add     Package   Start Cycle   BI Test
  Tools   Tools     Upload Receipt Results
```

### BI Workflow

```
Test Required → Test Started → Incubation → Results → Pass/Fail
      ↓            ↓            ↓           ↓         ↓
   Schedule     Start Test   Monitor    Read       Action
   Test         Incubate    Progress   Results    Required
```

## 🔒 Security

### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

- **Users**: Can only access their own data
- **Inventory**: Read access for all, write for owners
- **Sterilization**: Full access for authenticated users
- **Audit Logs**: Read-only for compliance

### Data Protection

- **Encryption**: All data encrypted at rest
- **Backups**: Automatic daily backups
- **Audit Trails**: Complete change tracking
- **Access Control**: Role-based permissions

## 📈 Performance

### Indexes

- **Primary Keys**: UUID with gen_random_uuid()
- **Foreign Keys**: Indexed for join performance
- **Search Fields**: Full-text search indexes
- **JSONB Fields**: GIN indexes for query performance

### Optimization

- **JSONB Compression**: LZ4 compression for large fields
- **Query Optimization**: Analyzed and optimized queries
- **Connection Pooling**: Configured for production
- **Monitoring**: Built-in performance monitoring

## 🧪 Testing

### Migration Testing

```bash
# Test migrations locally
npx supabase db reset
npx supabase db push

# Verify schema
npx supabase db diff
```

### Data Validation

```sql
-- Test data integrity
SELECT validate_sterilization_tool('tool-uuid-here');

-- Check table sizes
SELECT * FROM get_table_sizes();

-- Monitor performance
SELECT * FROM get_slow_queries();
```

## 📚 API Integration

### TypeScript Types

Generated types are available in `src/types/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/supabase';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### Real-time Subscriptions

```typescript
// Subscribe to tool changes
supabase
  .channel('tool-changes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'sterilization_tools' },
    (payload) => console.log('Tool changed:', payload)
  )
  .subscribe();
```

## 🚨 Troubleshooting

### Common Issues

#### Migration Conflicts

```bash
# Check migration status
npx supabase migration list

# Reset if needed
npx supabase db reset
```

#### Performance Issues

```sql
-- Check slow queries
SELECT * FROM get_slow_queries();

-- Analyze table sizes
SELECT * FROM get_table_sizes();
```

#### Security Issues

```sql
-- Verify RLS policies
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

### Emergency Procedures

1. **Database Lock**: Contact Supabase support
2. **Data Loss**: Restore from backup
3. **Performance**: Scale up database resources
4. **Security**: Review and update RLS policies

## 📖 Documentation

### Related Docs

- [Production Deployment Guide](../docs/PRODUCTION_DEPLOYMENT_GUIDE.md)
- [BI Workflow Documentation](../docs/PRODUCTION_BI_WORKFLOW.md)
- [API Documentation](../docs/API_DOCUMENTATION.md)

### External Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## 🤝 Contributing

### Development Guidelines

1. **Test all migrations** before committing
2. **Follow naming conventions** for files and tables
3. **Include documentation** for new features
4. **Update this README** when adding new tables
5. **Review security implications** of changes

### Code Review Checklist

- [ ] Migration syntax is correct
- [ ] Indexes are appropriate
- [ ] RLS policies are secure
- [ ] Performance impact is considered
- [ ] Documentation is updated

---

**Last Updated**: December 2024
**Version**: 1.1
**Maintainer**: Development Team
