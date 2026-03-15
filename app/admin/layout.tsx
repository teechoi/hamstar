// app/admin/layout.tsx
import { globalStyles, T } from '@/lib/theme'
import { AdminNav } from './components/AdminNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
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
