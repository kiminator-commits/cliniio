-- Add compliance requirement fields to audit_flags table
ALTER TABLE audit_flags 
ADD COLUMN IF NOT EXISTS compliance_standard TEXT,
ADD COLUMN IF NOT EXISTS regulation_reference TEXT,
ADD COLUMN IF NOT EXISTS requirement_description TEXT,
ADD COLUMN IF NOT EXISTS corrective_action TEXT,
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS responsible_party TEXT;

-- Add comments to explain the new fields
COMMENT ON COLUMN audit_flags.compliance_standard IS 'The compliance standard being violated (e.g., AAMI ST79, FDA 21 CFR)';
COMMENT ON COLUMN audit_flags.regulation_reference IS 'Specific regulation or standard reference (e.g., AAMI ST79:2017 Section 3.3.2)';
COMMENT ON COLUMN audit_flags.requirement_description IS 'Detailed description of the compliance requirement';
COMMENT ON COLUMN audit_flags.corrective_action IS 'Specific corrective action required to resolve the issue';
COMMENT ON COLUMN audit_flags.due_date IS 'Deadline for resolving the compliance issue';
COMMENT ON COLUMN audit_flags.responsible_party IS 'Person or department responsible for resolving the issue';
