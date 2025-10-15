-- Stores unresolved anomaly flags detected by AI or validation logic.
CREATE TABLE IF NOT EXISTS audit_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id uuid REFERENCES facilities(id) ON DELETE CASCADE,
  related_table text,
  related_id uuid,
  severity text DEFAULT 'medium', -- low | medium | high
  description text,
  resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_flags_facility_id ON audit_flags(facility_id);
CREATE INDEX IF NOT EXISTS idx_audit_flags_resolved ON audit_flags(resolved);
