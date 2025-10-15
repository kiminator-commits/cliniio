-- Add location tracking fields
ALTER TABLE sterilization_batches ADD COLUMN IF NOT EXISTS location_barcode TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS scanned_location TEXT;

-- Facility settings table
CREATE TABLE IF NOT EXISTS facility_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id uuid REFERENCES facilities(id),
  settings jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_sterilization_batches_location_barcode ON sterilization_batches(location_barcode);
CREATE INDEX IF NOT EXISTS idx_inventory_items_scanned_location ON inventory_items(scanned_location);
