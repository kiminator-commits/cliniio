import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { aiServiceIntegration } from '../../../src/services/ai/AIServiceIntegration';
import { unifiedRAGService } from '../../../src/services/ai/rag/UnifiedRAGService';

// Validate OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to analyze trends
function analyzeTrends(historicalData: Record<string, unknown>[]): Record<string, unknown> {
  if (!historicalData || historicalData.length === 0) {
    return { trend: 'insufficient_data', confidence: 0 };
  }
  
  // Simple trend analysis
  const recentData = historicalData.slice(-10);
  const olderData = historicalData.slice(-20, -10);
  
  const recentAvg = recentData.reduce((sum, item) => sum + (item.completion_rate || 0), 0) / recentData.length;
  const olderAvg = olderData.reduce((sum, item) => sum + (item.completion_rate || 0), 0) / olderData.length;
  
  return {
    trend: recentAvg > olderAvg ? 'improving' : recentAvg < olderAvg ? 'declining' : 'stable',
    confidence: Math.abs(recentAvg - olderAvg) / Math.max(recentAvg, olderAvg, 0.1),
    recentAverage: recentAvg,
    olderAverage: olderAvg
  };
}

export async function POST(req: NextRequest) {
  try {
    const { historicalData, facilityMetrics } = await req.json();

    if (!historicalData || !facilityMetrics) {
      return NextResponse.json(
        { error: 'Missing required data: historicalData, facilityMetrics' },
        { status: 400 }
      );
    }

    // Use RAG-enhanced forecasting
    const ragRequest = {
      query: `Analyze historical sterilization data and provide predictions for cycle completion rates, equipment maintenance needs, BI test pass rates, and operator efficiency trends`,
      userRole: 'Forecasting Analyst',
      feature: 'forecasts' as const,
      additionalContext: {
        historicalData: historicalData.slice(-50),
        facilityMetrics,
        trends: analyzeTrends(historicalData)
      }
    };

    const ragResponse = await unifiedRAGService.generateResponse(ragRequest);
    
    // Generate forecasts using RAG context
    const prompt = `Based on RAG-enhanced context, analyze sterilization facility data and provide predictions:

RAG Context: ${JSON.stringify(ragResponse.sourceBreakdown)}
Historical Cycles: ${JSON.stringify(historicalData.slice(-50))}
Facility Metrics: ${JSON.stringify(facilityMetrics)}

Generate predictions for:
1. Cycle completion rates (next 30 days)
2. Equipment maintenance needs (next 90 days)
3. BI test pass rates (next 60 days)
4. Operator efficiency trends (next 30 days)

Return as JSON array with structure:
[{"metric": "...", "currentValue": 0, "predictedValue": 0, "timeframe": "...", "confidence": 0.95, "factors": ["..."], "recommendations": ["..."], "ragSources": ["knowledge_base", "historical_analysis"]}]`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Track token usage
    const inputTokens = response.usage?.prompt_tokens || 0;
    const outputTokens = response.usage?.completion_tokens || 0;
    aiServiceIntegration.trackForecastingUsage(inputTokens, outputTokens, true);

    // Parse JSON response and add RAG metadata
    const forecasts = JSON.parse(content);
    forecasts.ragMetadata = {
      enabled: ragResponse.ragEnabled,
      confidence: ragResponse.confidence,
      questionType: ragResponse.questionType,
      sourceBreakdown: ragResponse.sourceBreakdown,
      processingTime: ragResponse.metadata?.processingTime
    };
    
    return NextResponse.json(forecasts);
  } catch (error) {
    console.error('Forecasts API error:', error);
    
    // Track failed request
    aiServiceIntegration.trackForecastingUsage(0, 0, false);
    
    return NextResponse.json(
      { error: 'Failed to generate forecasts' },
      { status: 500 }
    );
  }
}
