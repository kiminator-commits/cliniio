-- Create monitoring_events table for application monitoring
CREATE TABLE IF NOT EXISTS public.monitoring_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL,
    action TEXT NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('info', 'warning', 'error', 'critical')),
    message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.monitoring_events ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert monitoring events
CREATE POLICY "Users can insert monitoring events" ON public.monitoring_events
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        auth.uid() IN (
            SELECT id FROM public.users 
            WHERE facility_id = monitoring_events.facility_id
        )
    );

-- Allow facility admins to read monitoring events for their facility
CREATE POLICY "Facility admins can read monitoring events" ON public.monitoring_events
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM public.users 
            WHERE facility_id = monitoring_events.facility_id
            AND role IN ('admin', 'super_admin')
        )
    );

-- Create indexes for performance
CREATE INDEX idx_monitoring_events_created_at ON public.monitoring_events(created_at);
CREATE INDEX idx_monitoring_events_category ON public.monitoring_events(category);
CREATE INDEX idx_monitoring_events_level ON public.monitoring_events(level);
CREATE INDEX idx_monitoring_events_user_id ON public.monitoring_events(user_id);
CREATE INDEX idx_monitoring_events_facility_id ON public.monitoring_events(facility_id);
