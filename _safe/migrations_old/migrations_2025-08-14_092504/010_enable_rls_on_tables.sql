-- Migration: Enable RLS on Tables
-- This migration enables Row Level Security (RLS) on all tables that have RLS policies
-- but RLS is not enabled, which is causing Supabase linter errors and WebSocket issues

-- Enable RLS on biological_indicators table
ALTER TABLE public.biological_indicators ENABLE ROW LEVEL SECURITY;

-- Enable RLS on cleaning_schedules table
ALTER TABLE public.cleaning_schedules ENABLE ROW LEVEL SECURITY;

-- Enable RLS on dashboard_widgets table
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- Enable RLS on inventory_alerts table
ALTER TABLE public.inventory_alerts ENABLE ROW LEVEL SECURITY;

-- Enable RLS on inventory_audit_items table
ALTER TABLE public.inventory_audit_items ENABLE ROW LEVEL SECURITY;

-- Enable RLS on inventory_audits table
ALTER TABLE public.inventory_audits ENABLE ROW LEVEL SECURITY;

-- Enable RLS on inventory_categories table
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;

-- Enable RLS on inventory_items table
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- Enable RLS on inventory_reports table
ALTER TABLE public.inventory_reports ENABLE ROW LEVEL SECURITY;

-- Enable RLS on inventory_suppliers table
ALTER TABLE public.inventory_suppliers ENABLE ROW LEVEL SECURITY;

-- Enable RLS on inventory_transactions table
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on sterilization_cycles table
ALTER TABLE public.sterilization_cycles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_preferences table
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Enable RLS on the new BI failure tables we just created
ALTER TABLE public.bi_failure_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bi_resolution_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quarantined_tools ENABLE ROW LEVEL SECURITY; 