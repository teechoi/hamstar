// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { kanit } from '@/lib/fonts'

const inter = Inter({ subsets: ['latin'], weight: ['400', '600', '700', '800', '900'], display: 'swap' })

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
    <html lang="en" className={`${inter.className} ${kanit.variable}`}>
      <head />
      <body style={{ margin: 0, padding: 0, fontFamily: "'Inter', sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
