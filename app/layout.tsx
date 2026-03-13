// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://hamstarhub.xyz'),
  title: 'HamstarHub — Hamster Racing',
  description: 'Three hamsters. One wheel. The internet picks the champion.',
  openGraph: {
    title: 'HamstarHub',
    description: 'Hamster racing. F1-style sponsorships. Real pets. Real races.',
    images: ['/og-image.png'],
    url: 'https://hamstarhub.xyz',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@hamstarhub',
    title: 'HamstarHub',
    description: 'Hamster racing — real pets, real races',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: "'Inter', sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
