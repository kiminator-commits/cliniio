import { supabase } from '@/lib/supabaseClient';

export const aiInventoryRankingService = {
  async getRankedItems(days = 14) {
    try {
      const { data, error } = await supabase
        .from('inventory_usage_summary_view')
        .select('*')
        .gte(
          'usage_day',
          new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
        );

      if (error) throw error;
      if (!data?.length) return [];

      // Simple predictive weight: recency × frequency
      const ranked = data.map((item) => {
        const daysAgo =
          (Date.now() - new Date(item.usage_day).getTime()) /
          (1000 * 60 * 60 * 24);
        const recencyWeight = Math.max(0, 14 - daysAgo) / 14;
        const frequencyWeight = item.total_usages;
        const score = recencyWeight * 0.6 + frequencyWeight * 0.4;
        return { ...item, score };
      });

      return ranked.sort((a, b) => b.score - a.score);
    } catch (err) {
      console.error('AI Ranking Error:', err);
      return [];
    }
  },

  async getTopPredictedItems(limit = 10) {
    const ranked = await this.getRankedItems();
    return ranked.slice(0, limit);
  },
};
