// lib/hooks/useCountdown.ts
'use client'
import { useState, useEffect } from 'react'
import { formatCountdown } from '@/lib/race-scheduler'

export function useCountdown(targetMs: number) {
  const [remaining, setRemaining] = useState(targetMs - Date.now())

  useEffect(() => {
    const tick = () => setRemaining(targetMs - Date.now())
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [targetMs])

  return formatCountdown(remaining)
}
