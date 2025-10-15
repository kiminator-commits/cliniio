import { openai } from '@/lib/openai';
import { supabase } from '@/lib/supabaseClient';
import { logActivity } from './activityLogger';

/**
 * Runs once per day — summarizes anomalies and logs results.
 * Uses GPT-4o-mini for a single, cheap audit summary.
 */
export async function runDailyAiAudit(facilityId: string) {
  try {
    const { data, error } = await supabase.rpc('get_daily_anomaly_summary', {
      facility_id: facilityId,
    });
    if (error) throw error;

    const prompt = `
Summarize this anomaly report in under 60 words.  
Highlight potential compliance risks.  
Return one sentence summary only.

${JSON.stringify(data).slice(0, 1000)}
    `.trim();

    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 60,
      temperature: 0,
    });

    const summary =
      res.choices?.[0]?.message?.content?.trim() ?? 'No summary generated.';

    await logActivity({
      userId: 'system',
      facilityId,
      module: 'audit',
      activityType: 'daily_ai_audit',
      description: summary,
      metadata: { anomaly_count: data?.length ?? 0 },
    });

    return summary;
  } catch (err) {
    console.error('Daily AI audit failed:', err);
  }
}
