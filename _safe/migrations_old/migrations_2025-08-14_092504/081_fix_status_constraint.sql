-- Migration: Fix status constraint in inventory_items table
-- This updates the check_status_valid constraint to include the status values used by the frontend

-- Drop the existing constraint
ALTER TABLE inventory_items DROP CONSTRAINT IF EXISTS check_status_valid;

-- Add the updated constraint with the correct status values
ALTER TABLE inventory_items 
  ADD CONSTRAINT check_status_valid 
    CHECK (status IN ('Available', 'In Use', 'Maintenance', 'Out of Stock')); 