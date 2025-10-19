import { supabase } from "@/lib/supabaseClient";

export interface DailyAnalytics {
  facility_id: string;
  facility_name: string;
  usage_date: string;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  success_rate: number;
  total_prompt_tokens: number;
  total_response_tokens: number;
  avg_tokens_per_request: number;
  last_request_at: string;
}

export interface ModuleSummary {
  facility_id: string;
  facility_name: string;
  module: string;
  model: string;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  success_rate: number;
  total_prompt_tokens: number;
  total_response_tokens: number;
  avg_tokens_per_request: number;
  last_request_at: string;
}

export interface DashboardData {
  facility_id: string;
  facility_name: string;
  usage_date: string;
  module: string;
  model: string;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  success_rate: number;
  total_prompt_tokens: number;
  total_response_tokens: number;
  avg_tokens_per_request: number;
  last_request_at: string;
}

export async function fetchDailyAnalytics(facilityId: string): Promise<DailyAnalytics[]> {
  try {
    const { data, error } = await supabase
      .from('ai_usage_analytics_view')
      .select('*')
      .eq('facility_id', facilityId);

    if (error) {
      console.error('Error fetching daily analytics:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching daily analytics:', error);
    return [];
  }
}

export async function fetchModuleSummary(facilityId: string): Promise<ModuleSummary[]> {
  try {
    const { data, error } = await supabase
      .from('ai_usage_summary_view')
      .select('*')
      .eq('facility_id', facilityId);

    if (error) {
      console.error('Error fetching module summary:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching module summary:', error);
    return [];
  }
}

export async function fetchDashboardData(facilityId: string): Promise<DashboardData[]> {
  try {
    const { data, error } = await supabase
      .from('ai_usage_dashboard_view')
      .select('*')
      .eq('facility_id', facilityId);

    if (error) {
      console.error('Error fetching dashboard data:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return [];
  }
}
