// File: supabase/functions/openai/index.ts
// ⚠️ STRICT INSTRUCTION FOR CURSOR:
// DO NOT MODIFY ANY OTHER FILES.
// DO NOT MODIFY JSX.
// DO NOT TOUCH STATE LOGIC, STYLING, OR BEHAVIOR.
// DO NOT ADD OR REMOVE ANY COMPONENTS OR VARIABLES NOT LISTED BELOW.
// DO NOT COMMIT OR PUSH CHANGES.
// DO NOT CHANGE UI.
// DO NOT RENAME ANYTHING.
// DO NOT REFORMAT CODE UNLESS EXPLICITLY INSTRUCTED.
// ONLY PERFORM THE SPECIFIC EDIT REQUESTED IN THIS PROMPT.

// Deno types for Supabase Edge Functions
declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response>) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  Vary: 'Origin',
};

Deno.serve(async (req) => {
  // Health & preflight: MUST return 200 so the local runner doesn't kill the runtime
  if (req.method === 'OPTIONS' || req.method === 'GET') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only POST does AI work
  if (req.method !== 'POST') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return json(500, {
        error: 'Missing OPENAI_API_KEY (set in Functions → Secrets)',
      });
    }

    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      // Ignore JSON parsing errors
    }
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
    const context =
      typeof body?.context === 'string' ? body.context.trim() : '';
    if (!prompt) return json(400, { error: "Missing 'prompt'." });

    const systemPrompt = `You are Cliniio's embedded clinical assistant, specializing in healthcare facility management, sterilization protocols, inventory management, and compliance workflows.

KEY KNOWLEDGE AREAS:
- Sterilization cycles and autoclave operations
- Biological indicator testing and validation
- Inventory management for medical supplies
- Environmental cleaning protocols
- Regulatory compliance (FDA, CDC, AAMI, ISO)
- Clinical workflow optimization
- Equipment maintenance and calibration
- Quality assurance and documentation

RESPONSE STYLE:
- Be concise, accurate, and clinically safe
- Reference relevant standards when applicable
- Provide actionable, step-by-step guidance
- Always prioritize patient safety and compliance
- Use clear, professional medical terminology`;

    const fullPrompt = `${systemPrompt}\n\n${context ? `Context:\n${context}\n\n` : ''}Prompt: ${prompt}`;

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: fullPrompt,
        },
      ],
      temperature: 0.2,
    };

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const details = await resp.text().catch(() => 'unknown');
      return json(502, { error: 'OpenAI API error', details });
    }

    const data = await resp.json();
    const answer = data?.choices?.[0]?.message?.content ?? '';
    return json(200, { answer });
  } catch (err: unknown) {
    return json(500, {
      error: 'AI service error',
      details: String(err?.message ?? err),
    });
  }
});

function json(status: number, data: unknown) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
