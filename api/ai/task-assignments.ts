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
    const { analysisData } = await req.json();

    if (!analysisData) {
      return NextResponse.json(
        { error: 'Missing required data: analysisData' },
        { status: 400 }
      );
    }

    const { operationalGaps, availableUsers, configuration, facilityContext } =
      analysisData;

    if (
      !operationalGaps ||
      !availableUsers ||
      !configuration ||
      !facilityContext
    ) {
      return NextResponse.json(
        { error: 'Missing required analysis data fields' },
        { status: 400 }
      );
    }

    const prompt = `Analyze the following operational gaps and assign tasks to users optimally:

Operational Gaps: ${JSON.stringify(operationalGaps, null, 2)}
Available Users: ${JSON.stringify(availableUsers, null, 2)}
Configuration: ${JSON.stringify(configuration, null, 2)}
Facility Context: ${JSON.stringify(facilityContext, null, 2)}

Please provide a JSON response with task assignments that:
1. Respects max tasks per user (${configuration.maxTasksPerUser})
2. Prioritizes urgent and high priority tasks
3. Matches user roles to task categories
4. Balances workload across users
5. Considers task priority and estimated duration

Return only valid JSON.`;

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
    const assignments = JSON.parse(content);
    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Task assignments API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate task assignments' },
      { status: 500 }
    );
  }
}
