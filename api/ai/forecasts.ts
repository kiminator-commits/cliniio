import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Validate OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { historicalData, facilityMetrics } = await req.json();

    if (!historicalData || !facilityMetrics) {
      return NextResponse.json(
        { error: 'Missing required data: historicalData, facilityMetrics' },
        { status: 400 }
      );
    }

    const prompt = `Analyze this sterilization facility data and provide predictions:

Historical Cycles: ${JSON.stringify(historicalData.slice(-50))}
Facility Metrics: ${JSON.stringify(facilityMetrics)}

Generate predictions for:
1. Cycle completion rates (next 30 days)
2. Equipment maintenance needs (next 90 days)
3. BI test pass rates (next 60 days)
4. Operator efficiency trends (next 30 days)

Return as JSON array with structure:
[{"metric": "...", "currentValue": 0, "predictedValue": 0, "timeframe": "...", "confidence": 0.95, "factors": ["..."], "recommendations": ["..."]}]`;

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

    // Parse JSON response
    const forecasts = JSON.parse(content);
    return NextResponse.json(forecasts);
  } catch (error) {
    console.error('Forecasts API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate forecasts' },
      { status: 500 }
    );
  }
}
