// app/admin/layout.tsx
import { Inter } from 'next/font/google'
import { globalStyles, T } from '@/lib/theme'
import { AdminNav } from './components/AdminNav'

const inter = Inter({ subsets: ['latin'], weight: ['400', '600', '700', '800', '900'], display: 'swap' })

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <head />
      <body style={{ margin: 0, padding: 0, fontFamily: "'Inter', sans-serif", background: T.bg }}>
        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <AdminNav />
          <main style={{ flex: 1, minWidth: 0, paddingBottom: 80 }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
