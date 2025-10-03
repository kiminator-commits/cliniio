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
    const { question, context, userRole } = await req.json();

    if (!question || !context || !userRole) {
      return NextResponse.json(
        { error: 'Missing required data: question, context, userRole' },
        { status: 400 }
      );
    }

    const prompt = `Provide helpful guidance for a ${userRole}:

Question: ${question}
Context: ${context}

Provide:
1. Clear, actionable steps
2. Safety considerations
3. Best practices
4. Relevant regulations
5. Additional resources if needed

Format as clear, structured guidance.`;

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

    return NextResponse.json({ help: content });
  } catch (error) {
    console.error('Help API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate help' },
      { status: 500 }
    );
  }
}
