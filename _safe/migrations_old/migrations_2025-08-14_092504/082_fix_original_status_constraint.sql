-- Migration: Fix original status constraint in inventory_items table
-- This updates the original status constraint that was defined in the table creation

-- Drop the original constraint that was created with the table
ALTER TABLE inventory_items DROP CONSTRAINT IF EXISTS inventory_items_status_check;

-- Add the updated constraint with the correct status values
ALTER TABLE inventory_items 
  ADD CONSTRAINT inventory_items_status_check 
    CHECK (status IN ('Available', 'In Use', 'Maintenance', 'Out of Stock')); 