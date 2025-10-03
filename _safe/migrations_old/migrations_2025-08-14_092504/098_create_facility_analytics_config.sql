-- Create facility_analytics_config table
CREATE TABLE IF NOT EXISTS public.facility_analytics_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE,
    providers JSONB DEFAULT '{}'::jsonb,
    default_provider TEXT DEFAULT 'supabase',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.facility_analytics_config ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their facility's config
CREATE POLICY "Users can read their facility analytics config" ON public.facility_analytics_config
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM public.users 
            WHERE facility_id = facility_analytics_config.facility_id
        )
    );

-- Allow authenticated users to update their facility's config
CREATE POLICY "Users can update their facility analytics config" ON public.facility_analytics_config
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT id FROM public.users 
            WHERE facility_id = facility_analytics_config.facility_id
        )
    );

-- Allow authenticated users to insert config for their facility
CREATE POLICY "Users can insert their facility analytics config" ON public.facility_analytics_config
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT id FROM public.users 
            WHERE facility_id = facility_analytics_config.facility_id
        )
    );

-- Create index for performance
CREATE INDEX idx_facility_analytics_config_facility_id ON public.facility_analytics_config(facility_id);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_facility_analytics_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_facility_analytics_config_updated_at
    BEFORE UPDATE ON public.facility_analytics_config
    FOR EACH ROW
    EXECUTE FUNCTION update_facility_analytics_config_updated_at();