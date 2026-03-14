// app/layout.tsx
import type { Metadata } from 'next'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://hamstarhub.xyz'),
  title: 'Hamstar — Who Will Be the Hamstar?',
  description: 'Three hamsters. One champion. The wheel decides.',
  openGraph: {
    title: 'Hamstar',
    description: 'Three racers. One champion. Who will be the Hamstar?',
    images: ['/og-image.png'],
    url: 'https://hamstarhub.xyz',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@hamstar',
    title: 'Hamstar',
    description: 'Who will be the Hamstar? Real hamsters. Real races.',
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
