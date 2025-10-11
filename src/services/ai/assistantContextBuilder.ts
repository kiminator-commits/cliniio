import { aiInventoryRankingService } from '@/services/ai/aiInventoryRankingService';

export async function buildAssistantContext(baseContext: string) {
  try {
    // ✅ Get usage insights (already implemented)
    const usageSummary =
      await intelligenceDataService.generateUsageInsightSummary();

    // ✅ Add predictive inventory ranking
    const topPredicted =
      await aiInventoryRankingService.getTopPredictedItems(5);
    const forecastSummary = topPredicted.length
      ? topPredicted
          .map(
            (item, i) =>
              `${i + 1}. ${item.item_name || 'Unknown item'} — projected demand score: ${item.score.toFixed(2)}`
          )
          .join('\n')
      : 'No forecasted high-demand items at the moment.';

    const enrichedContext = `
${baseContext}

=== Real-World Usage Insights ===
${usageSummary}

=== Forecasted High-Demand Inventory ===
${forecastSummary}
`;

    return enrichedContext.trim();
  } catch (error) {
    console.error('Error enriching AI assistant context:', error);
    return baseContext;
  }
}
