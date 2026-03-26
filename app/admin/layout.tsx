import { AdminNav } from './components/AdminNav'
import { A } from './theme'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', 'Helvetica Neue', sans-serif; background: ${A.bg}; color: ${A.text}; }
        input, textarea, select, button { font-family: inherit; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${A.border}; border-radius: 99px; }
        input[type=range]::-webkit-slider-thumb { background: currentColor; }
        .admin-page { padding: 32px 32px 80px; }
        .admin-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 768px) {
          .admin-page { padding: 20px 16px 100px; }
          .admin-2col { grid-template-columns: 1fr; }
        }
      `}</style>
      <div style={{ display: 'flex', minHeight: '100vh', background: A.bg }}>
        <AdminNav />
        <main style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>
    </>
  )
}
