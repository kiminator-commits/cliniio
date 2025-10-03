import { aiImpactMeasurementService } from '../../aiImpactMeasurementService';

/**
 * Get AI impact metrics for cost savings calculation
 */
export async function getAIImpactMetrics() {
  try {
    const aiImpactMetrics = await aiImpactMeasurementService.getAIImpactMetrics();
    return {
      monthly: aiImpactMetrics.costSavings.monthly,
      annual: aiImpactMetrics.costSavings.annual,
    };
  } catch (error) {
    console.warn('Failed to get AI impact metrics for cost savings:', error);
    // Return default values if service fails
    return { monthly: 0, annual: 0 };
  }
}
