-- Create office_closures table for managing facility closures and holidays
-- This integrates with the existing office hours settings to exclude non-working days from streak calculations

-- Table to store office closures and holidays
CREATE TABLE IF NOT EXISTS office_closures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  closure_date DATE NOT NULL,
  closure_type TEXT NOT NULL CHECK (closure_type IN ('holiday', 'weekend', 'custom', 'maintenance')),
  description TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurring_pattern JSONB, -- For recurring holidays like "every Monday" or "every December 25"
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(facility_id, closure_date)
);

-- Table to store facility office hours configuration
CREATE TABLE IF NOT EXISTS facility_office_hours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  working_days JSONB NOT NULL, -- {"monday": true, "tuesday": true, etc.}
  start_hour INTEGER NOT NULL CHECK (start_hour >= 0 AND start_hour <= 23),
  end_hour INTEGER NOT NULL CHECK (end_hour >= 0 AND end_hour <= 23),
  open_holidays BOOLEAN DEFAULT false,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(facility_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_office_closures_facility_date ON office_closures(facility_id, closure_date);
CREATE INDEX IF NOT EXISTS idx_office_closures_date ON office_closures(closure_date);
CREATE INDEX IF NOT EXISTS idx_office_closures_type ON office_closures(closure_type);
CREATE INDEX IF NOT EXISTS idx_facility_office_hours_facility ON facility_office_hours(facility_id);

-- Enable RLS
ALTER TABLE office_closures ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_office_hours ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view facility office hours" ON facility_office_hours
  FOR SELECT USING (true);

CREATE POLICY "Facility admins can manage office hours" ON facility_office_hours
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_facility_roles ufr 
      WHERE ufr.user_id = auth.uid() 
      AND ufr.facility_id = facility_office_hours.facility_id 
      AND ufr.role IN ('admin', 'owner')
    )
  );

CREATE POLICY "Users can view office closures for their facilities" ON office_closures
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_facility_roles ufr 
      WHERE ufr.user_id = auth.uid() 
      AND ufr.facility_id = office_closures.facility_id
    )
  );

CREATE POLICY "Facility admins can manage office closures" ON office_closures
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_facility_roles ufr 
      WHERE ufr.user_id = auth.uid() 
      AND ufr.facility_id = office_closures.facility_id 
      AND ufr.role IN ('admin', 'owner')
    )
  );

-- Add trigger to update updated_at
CREATE TRIGGER update_office_closures_updated_at
  BEFORE UPDATE ON office_closures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facility_office_hours_updated_at
  BEFORE UPDATE ON facility_office_hours
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default office hours for existing facilities
INSERT INTO facility_office_hours (facility_id, working_days, start_hour, end_hour, open_holidays)
SELECT 
  id,
  '{"monday": true, "tuesday": true, "wednesday": true, "thursday": true, "friday": true, "saturday": false, "sunday": false}'::jsonb,
  8,
  17,
  false
FROM facilities
ON CONFLICT (facility_id) DO NOTHING;
