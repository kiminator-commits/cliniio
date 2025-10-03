-- Optimize RLS policies for bi_failures table to prevent auth.uid() re-evaluation
-- This improves query performance by evaluating auth.uid() once per query instead of per row

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view failures for their facility" ON bi_failures;
DROP POLICY IF EXISTS "Users can manage failures for their facility" ON bi_failures;

-- Create optimized policies with auth.uid() wrapped in subquery
CREATE POLICY "Users can view failures for their facility" ON bi_failures
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = bi_failures.facility_id
        )
    );

CREATE POLICY "Users can manage failures for their facility" ON bi_failures
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = bi_failures.facility_id
        )
    ); 