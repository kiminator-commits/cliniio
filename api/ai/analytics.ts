import { NextRequest, NextResponse } from 'next/server';
import { UnifiedAIService } from '../../../src/services/ai/UnifiedAIService';
import { aiServiceIntegration } from '../../../src/services/ai/AIServiceIntegration';
import { unifiedRAGService } from '../../../src/services/ai/rag/UnifiedRAGService';

// Rate limiting and caching
const requestCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(ip: string): string {
  return `analytics_${ip}`;
}

function isRateLimited(ip: string): boolean {
  const key = getRateLimitKey(ip);
  const now = Date.now();
  const record = requestCounts.get(key);

  if (!record || now > record.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  record.count++;
  return false;
}

function getCacheKey(
  cycleData: unknown[],
  biTestData: unknown[],
  operatorData: unknown[]
): string {
  // Create a hash of the data for caching
  const dataHash = JSON.stringify({
    cycleCount: cycleData.length,
    biCount: biTestData.length,
    operatorCount: operatorData.length,
    cycleLatest: cycleData[cycleData.length - 1]?.id,
    biLatest: biTestData[biTestData.length - 1]?.id,
    operatorLatest: operatorData[operatorData.length - 1]?.id,
  });
  return `analytics_${Buffer.from(dataHash).toString('base64').slice(0, 32)}`;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Get client IP for rate limiting
    const ip =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'unknown';

    // Check rate limit
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const { cycleData, biTestData, operatorData } = await req.json();

    if (!cycleData || !biTestData || !operatorData) {
      return NextResponse.json(
        { error: 'Missing required data: cycleData, biTestData, operatorData' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = getCacheKey(cycleData, biTestData, operatorData);
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        ...cached.data,
        cached: true,
        responseTime: Date.now() - startTime,
      });
    }

    // Optimize data size - limit to most recent and relevant data
    const optimizedCycleData = cycleData
      .slice(-15) // Last 15 cycles
      .map((cycle) => ({
        id: cycle.id,
        status: cycle.status,
        start_time: cycle.start_time,
        end_time: cycle.end_time,
        cycle_type: cycle.cycle_type,
        temperature: cycle.temperature_celsius,
        pressure: cycle.pressure_psi,
        duration: cycle.duration_minutes,
      }));

    const optimizedBiData = biTestData
      .slice(-20) // Last 20 tests
      .map((test) => ({
        id: test.id,
        result: test.result,
        test_date: test.test_date,
        cycle_id: test.cycle_id,
        test_type: test.test_type,
      }));

    const optimizedOperatorData = operatorData
      .slice(-10) // Last 10 operators
      .map((operator) => ({
        id: operator.id,
        name: operator.name,
        role: operator.role,
        department: operator.department,
        last_activity: operator.last_activity,
      }));

    // Use RAG-enhanced analytics
    const ragRequest = {
      query: `Analyze sterilization facility data for performance trends, potential issues, optimization opportunities, and compliance status`,
      userRole: 'Analytics User',
      feature: 'analytics' as const,
      additionalContext: {
        analyticsData: {
          cycleData: optimizedCycleData,
          biTestData: optimizedBiData,
          operatorData: optimizedOperatorData
        }
      }
    };

    const ragResponse = await unifiedRAGService.generateResponse(ragRequest);
    
    // Generate structured insights using RAG context
    const prompt = `Based on the RAG-enhanced context, analyze this sterilization facility data:

RAG Context: ${JSON.stringify(ragResponse.sourceBreakdown)}
Data Points: ${optimizedCycleData.length} cycles, ${optimizedBiData.length} BI tests, ${optimizedOperatorData.length} operators

Generate insights about:
1. Performance trends
2. Potential issues  
3. Optimization opportunities
4. Compliance status

Return as JSON array with structure:
[{"type": "trend|anomaly|prediction|recommendation", "title": "...", "description": "...", "confidence": 0.95, "actionable": true, "priority": "low|medium|high|critical", "sources": ["knowledge_base", "data_analysis"]}]`;

    const content = await UnifiedAIService.askAI(prompt, {
      module: 'analytics',
      facilityId: 'unknown'
    });

    // Track token usage (estimated)
    const inputTokens = Math.ceil(prompt.length / 4);
    const outputTokens = Math.ceil(content.length / 4);
    aiServiceIntegration.trackAnalyticsUsage(inputTokens, outputTokens, true);

    // Parse JSON response and add RAG metadata
    const insights = JSON.parse(content);
    
    // Add RAG metadata to insights
    insights.ragMetadata = {
      enabled: ragResponse.ragEnabled,
      confidence: ragResponse.confidence,
      questionType: ragResponse.questionType,
      sourceBreakdown: ragResponse.sourceBreakdown,
      processingTime: ragResponse.metadata?.processingTime
    };

    // Cache the result
    requestCache.set(cacheKey, {
      data: insights,
      timestamp: Date.now(),
    });

    // Clean up old cache entries
    if (requestCache.size > 100) {
      const now = Date.now();
      for (const [key, value] of requestCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          requestCache.delete(key);
        }
      }
    }

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      ...insights,
      cached: false,
      responseTime,
      dataPoints: {
        cycles: optimizedCycleData.length,
        biTests: optimizedBiData.length,
        operators: optimizedOperatorData.length,
      },
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    const responseTime = Date.now() - startTime;

    // Track failed request
    aiServiceIntegration.trackAnalyticsUsage(0, 0, false);

    return NextResponse.json(
      {
        error: 'Failed to generate analytics insights',
        responseTime,
      },
      { status: 500 }
    );
  }
}
