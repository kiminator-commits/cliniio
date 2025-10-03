-- =====================================================
-- ADD INVENTORY REQUIRED FIELD CONSTRAINTS
-- =====================================================

-- Add NOT NULL constraints for core inventory fields
-- This ensures data integrity at the database level

-- Update inventory_items table to require core fields
ALTER TABLE inventory_items 
  ALTER COLUMN current_quantity SET NOT NULL,
  ALTER COLUMN unit_cost SET NOT NULL,
  ALTER COLUMN status SET NOT NULL;

-- Add check constraints for data validation
ALTER TABLE inventory_items 
  ADD CONSTRAINT check_current_quantity_positive 
    CHECK (current_quantity >= 0),
  ADD CONSTRAINT check_unit_cost_positive 
    CHECK (unit_cost >= 0),
  ADD CONSTRAINT check_status_valid 
    CHECK (status IN ('active', 'inactive', 'discontinued', 'quarantine'));

-- Add comments for documentation
COMMENT ON COLUMN inventory_items.current_quantity IS 'Current quantity in stock (required, must be >= 0)';
COMMENT ON COLUMN inventory_items.unit_cost IS 'Unit cost of the item (required, must be >= 0)';
COMMENT ON COLUMN inventory_items.status IS 'Item status (required, must be one of: active, inactive, discontinued, quarantine)';

-- Create function to validate inventory item data
CREATE OR REPLACE FUNCTION validate_inventory_item()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure required fields are not empty
  IF NEW.name IS NULL OR TRIM(NEW.name) = '' THEN
    RAISE EXCEPTION 'Item name is required and cannot be empty';
  END IF;
  
  IF NEW.category IS NULL OR TRIM(NEW.category) = '' THEN
    RAISE EXCEPTION 'Category is required and cannot be empty';
  END IF;
  
  IF NEW.location IS NULL OR TRIM(NEW.location) = '' THEN
    RAISE EXCEPTION 'Location is required and cannot be empty';
  END IF;
  
  -- Ensure quantities are non-negative
  IF NEW.current_quantity < 0 THEN
    RAISE EXCEPTION 'Current quantity cannot be negative';
  END IF;
  
  IF NEW.unit_cost < 0 THEN
    RAISE EXCEPTION 'Unit cost cannot be negative';
  END IF;
  
  -- Set default values if not provided
  IF NEW.current_quantity IS NULL THEN
    NEW.current_quantity := 0;
  END IF;
  
  IF NEW.unit_cost IS NULL THEN
    NEW.unit_cost := 0;
  END IF;
  
  IF NEW.status IS NULL THEN
    NEW.status := 'active';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate inventory items
DROP TRIGGER IF EXISTS validate_inventory_item_trigger ON inventory_items;
CREATE TRIGGER validate_inventory_item_trigger
  BEFORE INSERT OR UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION validate_inventory_item();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION validate_inventory_item() TO authenticated; 