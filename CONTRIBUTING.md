# Contributing to Cliniio

## Database Schema Management

### New Schema Workflow (Effective Immediately)

**IMPORTANT**: We have moved away from migration-based schema management to a baseline approach.

#### Schema Change Process:

1. **Apply Changes Directly**: All schema changes must be applied directly in the Supabase SQL editor or via SQL CLI
2. **Update Baseline**: After any schema change, immediately run:
   ```bash
   npx supabase db dump --linked --role-only > supabase/schema/baseline.sql
   ```
3. **Commit Changes**: Commit the updated `baseline.sql` to keep the repository in sync
4. **No Migrations**: No new migration files should ever be created or committed

#### Why This Approach?

- Eliminates migration drift issues
- Keeps repository schema in sync with production
- Simplifies deployment process
- Reduces complexity of schema management

#### Files to Never Modify:

- `supabase/migrations/` - This directory should remain empty
- Any migration files - These are no longer used

#### Baseline File:

- `supabase/schema/baseline.sql` - This is the single source of truth for the current schema
- Must be updated after every schema change
- Must be committed to version control
