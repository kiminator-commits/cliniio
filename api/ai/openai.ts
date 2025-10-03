import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

// Validate OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt, context } = await req.json();

    if (!prompt) {
      return new Response('Prompt is required', { status: 400 });
    }

    // Context-specific system prompts for Cliniio
    const systemPrompts = {
      analytics:
        'You are a healthcare analytics expert specializing in sterilization facility management. Provide data-driven insights and predictions.',
      courses:
        'You are a healthcare training specialist. Generate relevant course suggestions for sterilization professionals.',
      help: 'You are a healthcare facility management expert. Provide clear, actionable guidance for sterilization procedures.',
      default:
        'You are a healthcare AI assistant for Cliniio, a sterilization facility management system.',
    };

    const systemPrompt =
      systemPrompts[context as keyof typeof systemPrompts] ||
      systemPrompts.default;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      stream: true,
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return new Response('AI service error', { status: 500 });
  }
}
