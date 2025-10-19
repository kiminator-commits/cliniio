import { NextRequest, NextResponse } from 'next/server';
import { UnifiedAIService } from '../../../src/services/ai/UnifiedAIService';
import { aiServiceIntegration } from '../../../src/services/ai/AIServiceIntegration';
import { unifiedRAGService } from '../../../src/services/ai/rag/UnifiedRAGService';

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

    // Use RAG-enhanced task assignment
    const ragRequest = {
      query: `Analyze operational gaps and assign tasks to users optimally based on roles, capabilities, and workload`,
      userRole: 'Task Manager',
      feature: 'task-assignments' as const,
      additionalContext: {
        operationalGaps,
        availableUsers,
        configuration,
        facilityContext
      }
    };

    const ragResponse = await unifiedRAGService.generateResponse(ragRequest);
    
    // Generate task assignments using RAG context
    const prompt = `Based on RAG-enhanced context, analyze operational gaps and assign tasks optimally:

RAG Context: ${JSON.stringify(ragResponse.sourceBreakdown)}
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
6. Incorporates facility procedures and best practices

Return only valid JSON with RAG metadata.`;

    const content = await UnifiedAIService.askAI(prompt, {
      module: 'task-assignments',
      facilityId: facilityContext?.facilityId || 'unknown'
    });

    // Track token usage (estimated)
    const inputTokens = Math.ceil(prompt.length / 4);
    const outputTokens = Math.ceil(content.length / 4);
    aiServiceIntegration.trackTaskAssignmentUsage(inputTokens, outputTokens, true);

    // Parse JSON response and add RAG metadata
    const assignments = JSON.parse(content);
    assignments.ragMetadata = {
      enabled: ragResponse.ragEnabled,
      confidence: ragResponse.confidence,
      questionType: ragResponse.questionType,
      sourceBreakdown: ragResponse.sourceBreakdown,
      processingTime: ragResponse.metadata?.processingTime
    };
    
    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Task assignments API error:', error);
    
    // Track failed request
    aiServiceIntegration.trackTaskAssignmentUsage(0, 0, false);
    
    return NextResponse.json(
      { error: 'Failed to generate task assignments' },
      { status: 500 }
    );
  }
}
