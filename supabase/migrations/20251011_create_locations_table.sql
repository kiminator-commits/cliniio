-- LOCATION MANAGEMENT TABLE
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id uuid REFERENCES facilities(id) ON DELETE CASCADE,
  name text NOT NULL,
  barcode text UNIQUE NOT NULL,
  parent_id uuid REFERENCES locations(id),
  capacity int DEFAULT 0,
  status text DEFAULT 'active', -- active | full | maintenance | inactive
  created_at timestamptz DEFAULT now()
);

-- INDEXES FOR FAST LOOKUPS
CREATE INDEX IF NOT EXISTS idx_locations_facility_id ON locations(facility_id);
CREATE INDEX IF NOT EXISTS idx_locations_barcode ON locations(barcode);
CREATE INDEX IF NOT EXISTS idx_locations_parent_id ON locations(parent_id);
