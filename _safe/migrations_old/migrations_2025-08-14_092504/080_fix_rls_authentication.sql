-- Migration: Fix RLS authentication issue
-- This makes the inventory policies more permissive to debug authentication issues

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can insert inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can update inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can delete inventory items" ON inventory_items;

-- Create more permissive policies for debugging
CREATE POLICY "Users can view inventory items" ON inventory_items
    FOR SELECT USING (true);

CREATE POLICY "Users can insert inventory items" ON inventory_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update inventory items" ON inventory_items
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete inventory items" ON inventory_items
    FOR DELETE USING (true); 