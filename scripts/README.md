# Sample Data Scripts for Cliniio

These scripts help populate the database with sample data to resolve the analytics tab loading issue.

## Problem

The analytics tab in the sterilization module is stuck in perpetual loading because:

1. The `availableTools` array in the sterilization store is empty
2. No data exists in the `sterilization_tools` table
3. Missing BI test results and activity log data

## Solution

Run these SQL scripts in your Supabase database to populate sample data:

### 1. Insert Sample Sterilization Tools

```sql
-- Run this in Supabase SQL Editor
\i scripts/insert_sample_sterilization_tools.sql
```

This script inserts 20+ sample sterilization tools with the correct facility ID (`550e8400-e29b-41d4-a716-446655440000`) that the system expects.

### 2. Insert Sample BI and Activity Data

```sql
-- Run this in Supabase SQL Editor
\i scripts/insert_sample_bi_and_activity_data.sql
```

This script adds:

- 7 days of BI test results (all passing)
- 5 completed sterilization cycles
- 5 activity log entries

## What This Fixes

- ✅ Analytics tab will load with real data
- ✅ KPI cards will show actual metrics
- ✅ BI test results will display
- ✅ Activity log will show recent operations
- ✅ Tools will be available for sterilization workflows

## After Running Scripts

1. Refresh your application
2. Navigate to the sterilization analytics tab
3. The loading should complete and show real data
4. You can now test the full analytics functionality

## Notes

- All sample data uses the facility ID: `550e8400-e29b-41d4-a716-446655440000`
- Tools include various types: surgical instruments, endoscopes, power tools, specialty instruments
- Some tools are set to different statuses (available, in_cycle, maintenance) for testing
- Data spans the last week to provide meaningful analytics

## Troubleshooting

If you still see loading issues:

1. Check the browser console for errors
2. Verify the scripts ran successfully in Supabase
3. Check that your user has the correct facility_id in the users table
4. Ensure RLS policies allow access to the data
