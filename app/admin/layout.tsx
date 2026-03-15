// app/admin/layout.tsx
import { globalStyles, T } from '@/lib/theme'
import { AdminNav } from './components/AdminNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      <div style={{ display: 'flex', minHeight: '100vh', background: T.bg }}>
        <AdminNav />
        <main style={{ flex: 1, minWidth: 0, paddingBottom: 80 }}>
          {children}
        </main>
      </div>
    </>
  )
}
