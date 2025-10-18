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

export async function POST(req: NextRequest) {
  try {
    const { userRole, userDepartment, learningHistory, skillGaps } =
      await req.json();

    if (!userRole || !userDepartment || !learningHistory || !skillGaps) {
      return NextResponse.json(
        {
          error:
            'Missing required data: userRole, userDepartment, learningHistory, skillGaps',
        },
        { status: 400 }
      );
    }

    // Use RAG-enhanced course generation
    const ragRequest = {
      query: `Generate personalized course suggestions based on user role, department, learning history, and skill gaps`,
      userRole,
      feature: 'course-generation' as const,
      additionalContext: {
        userDepartment,
        learningHistory: learningHistory.slice(-10),
        skillGaps
      }
    };

    const ragResponse = await unifiedRAGService.generateResponse(ragRequest);
    
    // Generate course suggestions using RAG context
    const prompt = `Based on RAG-enhanced context, generate course suggestions for a ${userRole} in ${userDepartment}:

RAG Context: ${JSON.stringify(ragResponse.sourceBreakdown)}
Learning History: ${JSON.stringify(learningHistory.slice(-10))}
Skill Gaps: ${skillGaps.join(', ')}

Suggest courses that:
1. Address identified skill gaps
2. Are appropriate for the user's role and department
3. Build on existing knowledge
4. Follow healthcare training best practices
5. Incorporate facility-specific procedures and policies

Return as JSON array with structure:
[{"title": "...", "description": "...", "difficulty": "beginner|intermediate|advanced", "duration": "...", "topics": ["..."], "prerequisites": ["..."], "ragSources": ["knowledge_base", "course_catalog"]}]`;

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
    aiServiceIntegration.trackCourseGenerationUsage(inputTokens, outputTokens, true);

    // Parse JSON response and add RAG metadata
    const courses = JSON.parse(content);
    courses.ragMetadata = {
      enabled: ragResponse.ragEnabled,
      confidence: ragResponse.confidence,
      questionType: ragResponse.questionType,
      sourceBreakdown: ragResponse.sourceBreakdown,
      processingTime: ragResponse.metadata?.processingTime
    };
    
    return NextResponse.json(courses);
  } catch (error) {
    console.error('Courses API error:', error);
    
    // Track failed request
    aiServiceIntegration.trackCourseGenerationUsage(0, 0, false);
    
    return NextResponse.json(
      { error: 'Failed to generate course suggestions' },
      { status: 500 }
    );
  }
}
