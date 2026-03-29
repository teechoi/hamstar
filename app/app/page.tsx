// app/app/page.tsx — original tab-based race app (restored)
'use client'
import { useState } from 'react'
import { Nav } from '@/components/Nav'
import { RaceView } from '@/components/views/RaceView'
import { PetsView } from '@/components/views/PetsView'
import { CommunityView } from '@/components/views/CommunityView'
import { ArenasView } from '@/components/views/ArenasView'
import { SponsorsView } from '@/components/views/SponsorsView'
import { T, CheckerBar, globalStyles, useIsMobile } from '@/components/ui'
import { SITE } from '@/config/site'

type Tab = 'Race' | 'Pets' | 'Community' | 'Arenas' | 'Sponsors'

export default function Home() {
  const [tab, setTab] = useState<Tab>('Race')
  const isLive = SITE.stream.isLive
  const isMobile = useIsMobile() ?? false

  const views: Record<Tab, React.ReactNode> = {
    Race: <RaceView />,
    Pets: <PetsView />,
    Community: <CommunityView />,
    Arenas: <ArenasView />,
    Sponsors: <SponsorsView />,
  }

  const { socials } = SITE
  const footerLinks = [
    socials.twitter   && { label: 'Twitter',   href: socials.twitter   },
    socials.youtube   && { label: 'YouTube',   href: socials.youtube   },
    socials.tiktok    && { label: 'TikTok',    href: socials.tiktok    },
    socials.instagram && { label: 'Instagram', href: socials.instagram },
  ].filter(Boolean) as { label: string; href: string }[]

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      <Nav tab={tab} setTab={setTab} isLive={isLive} />
      <div style={{ minHeight: '100vh', background: T.bg, paddingTop: isMobile ? 88 : 70 }}>
        <main>{views[tab]}</main>
        <footer style={{ background: T.text, borderTop: `4px solid ${T.lime}` }}>
          <CheckerBar />
          <div style={{ padding: '20px 28px', maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ color: T.lime, fontSize: 13, fontWeight: 800 }}>🐹 Hamstar</span>
            <span style={{ color: '#8892BB', fontSize: 12 }}>Real hamsters · Real races · One champion</span>
            {footerLinks.length > 0 && (
              <div style={{ display: 'flex', gap: 16 }}>
                {footerLinks.map(({ label, href }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    style={{ color: '#8892BB', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                    {label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </footer>
      </div>
    </>
  )
}
