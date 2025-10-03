-- =====================================================
-- FIX INVENTORY RLS POLICIES - REMOVE CIRCULAR REFERENCES
-- =====================================================

-- Drop all existing inventory policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view inventory items in their facilities" ON inventory_items;
DROP POLICY IF EXISTS "Users can insert inventory items in their facilities" ON inventory_items;
DROP POLICY IF EXISTS "Users can update inventory items in their facilities" ON inventory_items;
DROP POLICY IF EXISTS "Users can delete inventory items in their facilities" ON inventory_items;

DROP POLICY IF EXISTS "Users can view inventory transactions in their facilities" ON inventory_transactions;
DROP POLICY IF EXISTS "Users can insert inventory transactions in their facilities" ON inventory_transactions;

DROP POLICY IF EXISTS "Users can view inventory suppliers in their facilities" ON inventory_suppliers;
DROP POLICY IF EXISTS "Users can manage inventory suppliers in their facilities" ON inventory_suppliers;

DROP POLICY IF EXISTS "Users can view inventory categories in their facilities" ON inventory_categories;
DROP POLICY IF EXISTS "Users can manage inventory categories in their facilities" ON inventory_categories;

DROP POLICY IF EXISTS "Users can view inventory audits in their facilities" ON inventory_audits;
DROP POLICY IF EXISTS "Users can manage inventory audits in their facilities" ON inventory_audits;

DROP POLICY IF EXISTS "Users can view inventory audit items in their facilities" ON inventory_audit_items;
DROP POLICY IF EXISTS "Users can manage inventory audit items in their facilities" ON inventory_audit_items;

DROP POLICY IF EXISTS "Users can view inventory alerts in their facilities" ON inventory_alerts;
DROP POLICY IF EXISTS "Users can manage inventory alerts in their facilities" ON inventory_alerts;

DROP POLICY IF EXISTS "Users can view inventory reports in their facilities" ON inventory_reports;
DROP POLICY IF EXISTS "Users can manage inventory reports in their facilities" ON inventory_reports;

-- Create simplified policies that don't cause infinite recursion
-- For inventory_items: Allow all authenticated users to access
DROP POLICY IF EXISTS "Users can view inventory items" ON inventory_items;
CREATE POLICY "Users can view inventory items" ON inventory_items
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert inventory items" ON inventory_items;
CREATE POLICY "Users can insert inventory items" ON inventory_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update inventory items" ON inventory_items;
CREATE POLICY "Users can update inventory items" ON inventory_items
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete inventory items" ON inventory_items;
CREATE POLICY "Users can delete inventory items" ON inventory_items
    FOR DELETE USING (auth.role() = 'authenticated');

-- For inventory_transactions: Allow all authenticated users to access
DROP POLICY IF EXISTS "Users can view inventory transactions" ON inventory_transactions;
CREATE POLICY "Users can view inventory transactions" ON inventory_transactions
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert inventory transactions" ON inventory_transactions;
CREATE POLICY "Users can insert inventory transactions" ON inventory_transactions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- For inventory_suppliers: Allow all authenticated users to access
DROP POLICY IF EXISTS "Users can view inventory suppliers" ON inventory_suppliers;
CREATE POLICY "Users can view inventory suppliers" ON inventory_suppliers
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can manage inventory suppliers" ON inventory_suppliers;
CREATE POLICY "Users can manage inventory suppliers" ON inventory_suppliers
    FOR ALL USING (auth.role() = 'authenticated');

-- For inventory_categories: Allow all authenticated users to access
DROP POLICY IF EXISTS "Users can view inventory categories" ON inventory_categories;
CREATE POLICY "Users can view inventory categories" ON inventory_categories
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can manage inventory categories" ON inventory_categories;
CREATE POLICY "Users can manage inventory categories" ON inventory_categories
    FOR ALL USING (auth.role() = 'authenticated');

-- For inventory_audits: Allow all authenticated users to access
DROP POLICY IF EXISTS "Users can view inventory audits" ON inventory_audits;
CREATE POLICY "Users can view inventory audits" ON inventory_audits
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can manage inventory audits" ON inventory_audits;
CREATE POLICY "Users can manage inventory audits" ON inventory_audits
    FOR ALL USING (auth.role() = 'authenticated');

-- For inventory_audit_items: Allow all authenticated users to access
DROP POLICY IF EXISTS "Users can view inventory audit items" ON inventory_audit_items;
CREATE POLICY "Users can view inventory audit items" ON inventory_audit_items
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can manage inventory audit items" ON inventory_audit_items;
CREATE POLICY "Users can manage inventory audit items" ON inventory_audit_items
    FOR ALL USING (auth.role() = 'authenticated');

-- For inventory_alerts: Allow all authenticated users to access
DROP POLICY IF EXISTS "Users can view inventory alerts" ON inventory_alerts;
CREATE POLICY "Users can view inventory alerts" ON inventory_alerts
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can manage inventory alerts" ON inventory_alerts;
CREATE POLICY "Users can manage inventory alerts" ON inventory_alerts
    FOR ALL USING (auth.role() = 'authenticated');

-- For inventory_reports: Allow all authenticated users to access
DROP POLICY IF EXISTS "Users can view inventory reports" ON inventory_reports;
CREATE POLICY "Users can view inventory reports" ON inventory_reports
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can manage inventory reports" ON inventory_reports;
CREATE POLICY "Users can manage inventory reports" ON inventory_reports
    FOR ALL USING (auth.role() = 'authenticated'); 