import { supabase } from '@/lib/supabaseClient';

export const intelligenceDataService = {
  // ✅ Fetch summarized usage data for AI context
  async getInventoryUsageSummary(days = 7) {
    const { data, error } = await supabase
      .from('inventory_usage_summary_view')
      .select('*')
      .gte(
        'usage_day',
        new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      )
      .order('usage_day', { ascending: false });

    if (error) {
      console.error('Error fetching inventory usage summary:', error);
      return [];
    }
    return data || [];
  },

  // ✅ Example: Generate a human-readable summary for AI
  async generateUsageInsightSummary() {
    const data = await this.getInventoryUsageSummary(7);
    if (!data.length) return 'No usage data available this week.';

    const topItem = data.sort((a, b) => b.total_usages - a.total_usages)[0];
    return `The most used item this week is ${topItem.item_name || 'an unknown item'}, 
with ${topItem.total_usages} recorded uses across ${topItem.distinct_users} users.`;
  },
};
