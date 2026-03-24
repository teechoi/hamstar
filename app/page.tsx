import { getCurrentRaceWindow } from '@/lib/race-scheduler'
import { LandingNav }     from '@/components/landing/LandingNav'
import { HeroSection }    from '@/components/landing/HeroSection'
import { AboutSection }   from '@/components/landing/AboutSection'
import { RacersSection }  from '@/components/landing/RacersSection'
import { ArenaSection }   from '@/components/landing/ArenaSection'
import { LandingFooter }  from '@/components/landing/LandingFooter'

export default function LandingPage() {
  const race = getCurrentRaceWindow()
  const isLive = race.status === 'LIVE'
  const targetMs = isLive ? race.endsAt.getTime() : race.startsAt.getTime()

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', 'Helvetica Neue', sans-serif; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.8)} }
        @media (max-width: 640px) { .section-deco { display: none !important; } }
      `}</style>
      <div style={{ position: 'relative' }}>
        <LandingNav />
        <main>
          <HeroSection />
          <AboutSection />
          <RacersSection />
          <ArenaSection targetMs={targetMs} isLive={isLive} />
        </main>
        <LandingFooter />
      </div>
    </>
  )
}
