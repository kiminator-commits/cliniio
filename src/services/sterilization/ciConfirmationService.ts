/* ==========================================================
   FILE: src/services/sterilization/ciConfirmationService.ts
   PURPOSE: Centralized Supabase interface for CI pop-ups
   ========================================================== */

import { supabase } from '@/lib/supabaseClient';

// 🔹 Create or update CI confirmation for a tool
export async function upsertCiConfirmation({
  toolId,
  cycleId,
  facilityId,
  userId,
  ciAdded = false,
  ciPassed = false,
  notes = null,
}: {
  toolId: string;
  cycleId: string;
  facilityId: string;
  userId: string;
  ciAdded?: boolean;
  ciPassed?: boolean;
  notes?: string | null;
}) {
  try {
    const { data: existing } = await supabase
      .from('ci_confirmations')
      .select('id')
      .eq('tool_id', toolId)
      .eq('cycle_id', cycleId)
      .maybeSingle();

    const payload = {
      tool_id: toolId,
      cycle_id: cycleId,
      facility_id: facilityId,
      checked_by: userId,
      ci_added: ciAdded,
      ci_passed: ciPassed,
      notes,
      verified_at: ciPassed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      const { error } = await supabase
        .from('ci_confirmations')
        .update(payload)
        .eq('id', existing.id);
      if (error) throw error;
      console.info(`🔄 CI confirmation updated for tool ${toolId}`);
    } else {
      const { error } = await supabase.from('ci_confirmations').insert(payload);
      if (error) throw error;
      console.info(`✅ CI confirmation inserted for tool ${toolId}`);
    }

    return true;
  } catch (error) {
    console.error('❌ Error persisting CI confirmation:', error);
    return false;
  }
}

// 🔹 Batch CI confirmation for multiple tools in a cycle
export async function batchCiConfirmation({
  toolIds,
  cycleId,
  facilityId,
  userId,
  ciAdded = false,
  ciPassed = false,
  notes = null,
}: {
  toolIds: string[];
  cycleId: string;
  facilityId: string;
  userId: string;
  ciAdded?: boolean;
  ciPassed?: boolean;
  notes?: string | null;
}) {
  try {
    const confirmations = toolIds.map((toolId) => ({
      tool_id: toolId,
      cycle_id: cycleId,
      facility_id: facilityId,
      checked_by: userId,
      ci_added: ciAdded,
      ci_passed: ciPassed,
      notes,
      verified_at: ciPassed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('ci_confirmations')
      .upsert(confirmations, {
        onConflict: 'tool_id,cycle_id',
        ignoreDuplicates: false,
      });

    if (error) throw error;
    console.info(
      `✅ Batch CI confirmation for ${toolIds.length} tools in cycle ${cycleId}`
    );
    return true;
  } catch (error) {
    console.error('❌ Error persisting batch CI confirmation:', error);
    return false;
  }
}

/* ==========================================================
   HOW TO USE IN UI POP-UPS
   ----------------------------------------------------------
   1️⃣  Drying popup ( "CI Added?" ):
       await upsertCiConfirmation({
         toolId,
         cycleId,
         facilityId,
         userId,
         ciAdded: true,
       })

   2️⃣  Autoclave completion popup ( "CI Passed?" ):
       await upsertCiConfirmation({
         toolId,
         cycleId,
         facilityId,
         userId,
         ciPassed: true,
         notes: 'Visual check complete',
       })
   ----------------------------------------------------------
   The function automatically handles insert/update logic,
   facility scoping, and timestamps for verified_at.
   ========================================================== */
