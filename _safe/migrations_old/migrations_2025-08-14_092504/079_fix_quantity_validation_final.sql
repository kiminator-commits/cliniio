-- Migration: Final fix for quantity validation
-- This handles the case where minimum_quantity and maximum_quantity are not provided in the request

-- Drop the existing trigger first
DROP TRIGGER IF EXISTS validate_inventory_item_trigger ON inventory_items;

-- Update the validation function to handle missing quantity fields
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
  
  -- Allow empty locations - removed the location validation
  
  IF NEW.status IS NULL OR TRIM(NEW.status) = '' THEN
    RAISE EXCEPTION 'Status is required and cannot be empty';
  END IF;
  
  -- Set default values if not provided
  IF NEW.current_quantity IS NULL THEN
    NEW.current_quantity := 0;
  END IF;
  
  IF NEW.minimum_quantity IS NULL THEN
    NEW.minimum_quantity := 0;
  END IF;
  
  IF NEW.maximum_quantity IS NULL THEN
    NEW.maximum_quantity := 999999;
  END IF;
  
  IF NEW.unit_cost IS NULL THEN
    NEW.unit_cost := 0;
  END IF;
  
  -- Ensure quantities are non-negative
  IF NEW.current_quantity < 0 THEN
    RAISE EXCEPTION 'Current quantity cannot be negative';
  END IF;
  
  IF NEW.minimum_quantity < 0 THEN
    RAISE EXCEPTION 'Minimum quantity cannot be negative';
  END IF;
  
  IF NEW.maximum_quantity < 0 THEN
    RAISE EXCEPTION 'Maximum quantity cannot be negative';
  END IF;
  
  IF NEW.unit_cost < 0 THEN
    RAISE EXCEPTION 'Unit cost cannot be negative';
  END IF;
  
  -- Validate quantity relationships (after defaults are set)
  IF NEW.minimum_quantity > NEW.maximum_quantity THEN
    RAISE EXCEPTION 'Minimum quantity cannot be greater than maximum quantity';
  END IF;
  
  -- Only validate current vs maximum if maximum is not the default unlimited value
  -- AND if current quantity is greater than 0 (to allow initial items with 0 quantity)
  IF NEW.maximum_quantity < 999999 AND NEW.current_quantity > 0 AND NEW.current_quantity > NEW.maximum_quantity THEN
    RAISE EXCEPTION 'Current quantity cannot be greater than maximum quantity';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER validate_inventory_item_trigger
  BEFORE INSERT OR UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION validate_inventory_item(); 