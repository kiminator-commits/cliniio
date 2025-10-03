# Workflow Sessions RLS Fix 🔧

## Issue Description

The Environmental Clean page was failing to start due to a Row Level Security (RLS) policy violation on the `workflow_sessions` table. The error was:

```
❌ Failed to start environmental cleaning workflow session: Error: Failed to start session: new row violates row-level security policy for table "workflow_sessions"
```

## Root Cause

The `workflow_sessions` table has RLS enabled with policies that require:

1. `auth.role() = 'authenticated'` - User must be authenticated
2. `auth.uid() = operator_id` - The operator_id must match the current user's ID

However, the `WorkflowService.startSession()` method was not including the `operator_id` field in the insert operation, causing the RLS policy to reject the insert.

## Fixes Applied

### 1. Updated WorkflowService.startSession()

**File**: `src/services/workflowService.ts`

**Changes**:

- Added authentication check using `supabase.auth.getUser()`
- Include `operator_id: user.id` in the insert operation
- Added proper error handling for authentication failures

```typescript
// Before
const { data, error } = await supabase.from('workflow_sessions').insert({
  session_type: sessionType,
  operator_name: operatorName,
  status: 'active',
  metadata: metadata || {},
});

// After
const {
  data: { user },
  error: authError,
} = await supabase.auth.getUser();
if (authError || !user) {
  throw new Error('User not authenticated. Please log in again.');
}

const { data, error } = await supabase.from('workflow_sessions').insert({
  session_type: sessionType,
  operator_id: user.id, // ← Added this line
  operator_name: operatorName,
  status: 'active',
  metadata: metadata || {},
});
```

### 2. Updated WorkflowService.logEvent()

**File**: `src/services/workflowService.ts`

**Changes**:

- Added authentication check
- Include `operator_id: user.id` in the insert operation

### 3. Updated Environmental Clean Page

**File**: `src/pages/EnvironmentalClean/page.tsx`

**Changes**:

- Added better error handling for authentication errors
- Temporarily disabled workflow session creation to avoid blocking the page
- Added user-friendly console messages

### 4. Created RLS Policy Migration

**File**: `supabase/migrations/024_fix_workflow_sessions_rls.sql`

**Changes**:

- Drop and recreate RLS policies with proper conditions
- Ensure `operator_id` column exists
- Add proper foreign key constraints

## Temporary Workaround

To avoid blocking the Environmental Clean page while the RLS issues are being resolved, the workflow session creation has been temporarily disabled:

```typescript
// Temporarily disable workflow session creation to avoid RLS issues
// startEnvironmentalSession();
console.log(
  'ℹ️ Workflow session creation temporarily disabled to avoid RLS issues'
);
```

## How to Apply the Complete Fix

### Option 1: Run the Migration Script

If you have access to the Supabase CLI:

```bash
npx supabase db push
```

### Option 2: Run the Fix Script

```bash
npx tsx scripts/fixWorkflowSessionsRLS.ts
```

**Note**: This requires environment variables to be set.

### Option 3: Manual Database Fix

Run these SQL commands in your Supabase SQL editor:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all workflow sessions" ON public.workflow_sessions;
DROP POLICY IF EXISTS "Authenticated users can create workflow sessions" ON public.workflow_sessions;
DROP POLICY IF EXISTS "Authenticated users can update workflow sessions" ON public.workflow_sessions;
DROP POLICY IF EXISTS "Authenticated users can delete workflow sessions" ON public.workflow_sessions;

-- Create proper policies
CREATE POLICY "Users can view all workflow sessions" ON public.workflow_sessions
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create workflow sessions" ON public.workflow_sessions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = operator_id);

CREATE POLICY "Authenticated users can update their own workflow sessions" ON public.workflow_sessions
    FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = operator_id);

CREATE POLICY "Authenticated users can delete their own workflow sessions" ON public.workflow_sessions
    FOR DELETE USING (auth.role() = 'authenticated' AND auth.uid() = operator_id);
```

## Re-enabling Workflow Sessions

Once the RLS policies are fixed, you can re-enable workflow session creation by uncommenting this line in `src/pages/EnvironmentalClean/page.tsx`:

```typescript
// Change this:
// startEnvironmentalSession();

// To this:
startEnvironmentalSession();
```

## Testing the Fix

1. **Check Authentication**: Ensure you're logged in to the application
2. **Navigate to Environmental Clean**: The page should load without errors
3. **Re-enable Sessions**: Uncomment the session creation line
4. **Test Session Creation**: Check browser console for success messages
5. **Verify Database**: Check the `workflow_sessions` table for new entries

## Related Files

- `src/services/workflowService.ts` - Main service with authentication fixes
- `src/pages/EnvironmentalClean/page.tsx` - Page with temporary workaround
- `supabase/migrations/024_fix_workflow_sessions_rls.sql` - Database migration
- `scripts/fixWorkflowSessionsRLS.ts` - Fix script

## Future Improvements

1. **Better Error Handling**: Add user-facing error messages for authentication issues
2. **Session Recovery**: Implement session recovery for interrupted workflows
3. **Offline Support**: Add offline session tracking with sync when online
4. **User Preferences**: Allow users to disable session tracking if desired
