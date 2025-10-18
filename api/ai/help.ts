import { NextRequest, NextResponse } from 'next/server';
import { ragHelpService } from '../../../src/services/ai/rag/RAGHelpService';

// OpenAI API key validation is now handled in RAGHelpService

export async function POST(req: NextRequest) {
  try {
    const { question, context, userRole } = await req.json();

    if (!question || !context || !userRole) {
      return NextResponse.json(
        { error: 'Missing required data: question, context, userRole' },
        { status: 400 }
      );
    }

    // Use RAG-enhanced help service
    const ragResponse = await ragHelpService.generateHelpResponse(
      question,
      userRole,
      context
    );

    return NextResponse.json({
      help: ragResponse.answer,
      sources: ragResponse.sources,
      confidence: ragResponse.confidence,
      ragEnabled: true
    });
  } catch (error) {
    console.error('RAG Help API error:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate help' },
      { status: 500 }
    );
  }
}
