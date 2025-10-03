-- Fix RLS policies for facility_analytics_config table
-- Ensure policies are properly created and optimized for performance
-- NOTE: This migration is commented out because facility_analytics_config table doesn't exist yet
-- It will be created in migration 098

/*
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their facility analytics config" ON public.facility_analytics_config;
DROP POLICY IF EXISTS "Users can update their facility analytics config" ON public.facility_analytics_config;
DROP POLICY IF EXISTS "Users can insert their facility analytics config" ON public.facility_analytics_config;

-- Create optimized policies with auth.uid() wrapped in subquery for better performance
CREATE POLICY "Users can read their facility analytics config" ON public.facility_analytics_config
    FOR SELECT USING (
        (SELECT auth.uid()) IN (
            SELECT user_id FROM public.facility_users 
            WHERE facility_id = facility_analytics_config.facility_id
        )
    );

CREATE POLICY "Users can update their facility analytics config" ON public.facility_analytics_config
    FOR UPDATE USING (
        (SELECT auth.uid()) IN (
            SELECT user_id FROM public.facility_users 
            WHERE facility_id = facility_analytics_config.facility_id
        )
    );

CREATE POLICY "Users can insert their facility analytics config" ON public.facility_analytics_config
    FOR INSERT WITH CHECK (
        (SELECT auth.uid()) IN (
            SELECT user_id FROM public.facility_users 
            WHERE facility_id = facility_analytics_config.facility_id
        )
    );
*/ 