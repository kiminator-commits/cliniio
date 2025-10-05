import { supabase } from '@/lib/supabaseClient'

export async function completeChallenge({
  userId,
  challengeId,
  facilityId,
  pointsAwarded,
}: {
  userId: string
  challengeId: string
  facilityId: string
  pointsAwarded: number
}) {
  try {
    const { error } = await supabase
      .from('challenge_completions')
      .upsert(
        [
          {
            user_id: userId,
            challenge_id: challengeId,
            facility_id: facilityId,
            points_awarded: pointsAwarded,
            completed_at: new Date().toISOString(),
          },
        ],
        { onConflict: 'user_id,challenge_id,facility_id' }
      )

    if (error) throw error

    if (process.env.NODE_ENV === 'development') {
      console.debug(`🏁 Challenge ${challengeId} completed by ${userId} (${facilityId})`)
    }

    return true
  } catch (err: any) {
    console.error('completeChallenge failed:', err.message)
    return false
  }
}
