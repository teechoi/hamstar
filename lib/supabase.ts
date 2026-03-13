// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Browser client — safe to use in components
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server client — for API routes only (elevated permissions, never expose to browser)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// ─── REALTIME HELPERS ─────────────────────────────────────────────────────────

/**
 * Subscribe to live race entry updates (support bar changes as donations come in).
 * Returns a cleanup function — call it when the component unmounts.
 */
export function subscribeToRaceUpdates(
  raceId: string,
  onUpdate: (entry: { petId: string; totalSol: number }) => void
) {
  const channel = supabase
    .channel(`race-${raceId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'race_entries',
        filter: `raceId=eq.${raceId}`,
      },
      (payload) => {
        onUpdate({
          petId: payload.new.petId,
          totalSol: Number(payload.new.totalSol),
        })
      }
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}

/**
 * Subscribe to new donation events (live feed).
 * Returns a cleanup function — call it when the component unmounts.
 */
export function subscribeToDonations(
  raceId: string,
  onDonation: (donation: { alias: string | null; amountSol: number; petId: string }) => void
) {
  const channel = supabase
    .channel(`donations-${raceId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'donations',
        filter: `raceId=eq.${raceId}`,
      },
      (payload) => {
        onDonation({
          alias: payload.new.alias,
          amountSol: Number(payload.new.amountSol),
          petId: payload.new.petId,
        })
      }
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}
