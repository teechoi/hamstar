// lib/hooks/useRace.ts
'use client'
import { useState, useEffect, useCallback } from 'react'
import { subscribeToRaceUpdates } from '@/lib/supabase'
import type { Race } from '@/types'

export function useRace() {
  const [currentRace, setCurrentRace] = useState<Race | null>(null)
  const [pastRaces,   setPastRaces]   = useState<Race[]>([])
  const [totalSol,    setTotalSol]    = useState(0)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)

  const fetchRace = useCallback(async () => {
    try {
      const res  = await fetch('/api/races')
      if (!res.ok) throw new Error('Failed to fetch race')
      const data = await res.json()
      setCurrentRace(data.currentRace)
      setPastRaces(data.pastRaces)
      setTotalSol(data.totalSol)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch + 30s polling fallback
  useEffect(() => {
    fetchRace()
    const interval = setInterval(fetchRace, 30_000)
    return () => clearInterval(interval)
  }, [fetchRace])

  // Supabase Realtime — updates support bars instantly when a donation lands
  useEffect(() => {
    if (!currentRace) return
    const cleanup = subscribeToRaceUpdates(currentRace.id, ({ petId, totalSol: newTotal }) => {
      setCurrentRace((prev) => {
        if (!prev) return prev
        const entries = prev.entries.map((e) =>
          e.petId === petId ? { ...e, totalSol: newTotal } : e
        )
        setTotalSol(entries.reduce((sum, e) => sum + e.totalSol, 0))
        return { ...prev, entries: entries.sort((a, b) => b.totalSol - a.totalSol) }
      })
    })
    return () => { cleanup() }
  }, [currentRace?.id])

  return { currentRace, pastRaces, totalSol, loading, error, refetch: fetchRace }
}
