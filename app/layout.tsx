// app/layout.tsx
import type { Metadata } from 'next'
import { kanit } from '@/lib/fonts'
import { AppProviders } from '@/components/wallet/Providers'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://hamstarhub.xyz'),
  title: 'Hamstar',
  description: 'Three hamsters. One champion. The wheel decides.',
  manifest: '/manifest.json',
  icons: {
    icon: '/images/hamster-flash-flex.png',
    apple: '/images/hamster-flash-flex.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Hamstar',
  },
  openGraph: {
    title: 'Hamstar',
    description: 'Three racers. One champion. Who will be the Hamstar?',
    images: ['/images/hero-hamsters.png'],
    url: 'https://hamstarhub.xyz',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@hamstar',
    title: 'Hamstar',
    description: 'Who will be the Hamstar? Real hamsters. Real races.',
    images: ['/images/hero-hamsters.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={kanit.variable}>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pretendard@latest/dist/web/static/pretendard.css" />
        <meta name="theme-color" content="#FFE790" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: "'Pretendard', sans-serif" }}>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  )
}
