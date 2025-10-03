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

    const prompt = `Generate course suggestions for a ${userRole} in ${userDepartment}:

Learning History: ${JSON.stringify(learningHistory.slice(-10))}
Skill Gaps: ${skillGaps.join(', ')}

Suggest courses that:
1. Address identified skill gaps
2. Are appropriate for the user's role and department
3. Build on existing knowledge
4. Follow healthcare training best practices

Return as JSON array with structure:
[{"title": "...", "description": "...", "difficulty": "beginner|intermediate|advanced", "duration": "...", "topics": ["..."], "prerequisites": ["..."]}]`;

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
    const courses = JSON.parse(content);
    return NextResponse.json(courses);
  } catch (error) {
    console.error('Courses API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate course suggestions' },
      { status: 500 }
    );
  }
}
