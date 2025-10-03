-- Create error_reports table
CREATE TABLE IF NOT EXISTS public.error_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    context TEXT,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.error_reports ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert error reports
CREATE POLICY "Users can insert error reports" ON public.error_reports
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        auth.uid() IN (
            SELECT id FROM public.users 
            WHERE facility_id = error_reports.facility_id
        )
    );

-- Allow facility admins to read error reports for their facility
CREATE POLICY "Facility admins can read error reports" ON public.error_reports
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM public.users 
            WHERE facility_id = error_reports.facility_id
            AND role IN ('admin', 'super_admin')
        )
    );

-- Create indexes for performance
CREATE INDEX idx_error_reports_created_at ON public.error_reports(created_at);
CREATE INDEX idx_error_reports_user_id ON public.error_reports(user_id);
CREATE INDEX idx_error_reports_facility_id ON public.error_reports(facility_id);
CREATE INDEX idx_error_reports_context ON public.error_reports(context);