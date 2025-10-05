/**
 * @deprecated This service is deprecated in favor of UnifiedAIService
 * Use UnifiedAIService from '@/services/ai/UnifiedAIService' for new implementations
 * This service is maintained for backward compatibility
 *
 * File: src/services/aiService.ts
 * ⚠️ STRICT INSTRUCTION FOR CURSOR:
 * DO NOT MODIFY ANY OTHER FILES.
 * DO NOT MODIFY JSX.
 * DO NOT TOUCH STATE LOGIC, STYLING, OR BEHAVIOR.
 * DO NOT ADD OR REMOVE ANY COMPONENTS OR VARIABLES NOT LISTED BELOW.
 * DO NOT COMMIT OR PUSH CHANGES.
 * DO NOT CHANGE UI.
 * DO NOT RENAME ANYTHING.
 * DO NOT REFORMAT CODE UNLESS EXPLICITLY INSTRUCTED.
 * DO NOT RUN LINT OR FIX ERRORS UNLESS EXPLICITLY REQUESTED.
 * ONLY PERFORM THE SPECIFIC EDIT REQUESTED IN THIS PROMPT.
 */

import { optimizedAIService } from './ai/OptimizedAIService';
import { aiRateLimiter } from './rateLimiting/AIRateLimiter';
import { logger } from '../utils/_core/logger';

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai`;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export type AskAIParams = { prompt: string; context?: string };

export async function askCliniioAI({
  prompt,
  context = '',
}: AskAIParams): Promise<string> {
  console.warn(
    'askCliniioAI() is deprecated. Use UnifiedAIService.askAI() instead.'
  );

  if (!FN_URL) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  if (!ANON) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!prompt?.trim()) throw new Error('Missing prompt');

  // Check rate limit before proceeding
  const rateLimitResult = await aiRateLimiter.checkRateLimit('ai_user', true);
  if (!rateLimitResult.allowed) {
    throw new Error(
      `Rate limit exceeded. Please try again in ${rateLimitResult.retryAfter || 0} seconds.`
    );
  }

  // Use optimized AI service with caching and rate limiting
  const result = await optimizedAIService.execute(
    {
      service: 'openai',
      operation: 'ask_cliniio_ai',
      priority: 5, // High priority for user-facing requests
      useCache: true,
      cacheTtl: 3600, // Cache for 1 hour
      useBatching: false, // Don't batch user-facing requests
      maxRetries: 3,
      timeout: 30000,
      metadata: {
        prompt: prompt.substring(0, 100), // Truncated for logging
        context: context?.substring(0, 50),
      },
    },
    async () => {
      const res = await fetch(FN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Required when verify_jwt is ON (your case). Harmless if OFF.
          apikey: ANON,
          Authorization: `Bearer ${ANON}`,
        },
        body: JSON.stringify({ prompt, context }),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(`Function error ${res.status}: ${text}`);

      try {
        const data = JSON.parse(text);
        return String(data?.answer ?? '');
      } catch (err) {
        console.error(err);
        // If the function ever returns plain text
        return text;
      }
    },
    {
      parameters: { prompt, context },
    }
  );

  // Record the request for rate limiting
  await aiRateLimiter.recordRequest('ai_user', true);

  if (!result.success) {
    logger.error('AI request failed:', {
      error: result.error,
      prompt: prompt.substring(0, 100),
    });
    throw new Error(result.error || 'AI request failed');
  }

  return result.data || '';
}

/*
USAGE (example):
const reply = await askCliniioAI({ prompt: "Say hello", context: "Cliniio test" });
console.log("AI:", reply);
*/
