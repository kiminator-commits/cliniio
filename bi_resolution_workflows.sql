-- Create BI Resolution Workflows table
CREATE TABLE IF NOT EXISTS public.bi_resolution_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES public.bi_failure_incidents(id) ON DELETE CASCADE,
    resolution_steps JSONB,
    resolved_by UUID REFERENCES public.users(id),
    resolved_at TIMESTAMPTZ DEFAULT now()
);
