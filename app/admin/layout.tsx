import { AdminNav } from './components/AdminNav'
import { A } from './theme'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Pretendard, sans-serif; background: ${A.pageBg}; color: ${A.text}; }
        input, textarea, select, button { font-family: inherit; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${A.borderMid}; border-radius: 99px; }
        .admin-page { padding: 32px 36px 80px; }
        .admin-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .admin-search { width: 280px; }
        .admin-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
        @media (max-width: 768px) {
          .admin-page { padding: 20px 16px calc(80px + env(safe-area-inset-bottom, 0px)); }
          .admin-2col { grid-template-columns: 1fr; }
          .admin-search { width: 100%; }
          .admin-header { flex-direction: column; align-items: flex-start; }
          .admin-header > * { width: 100%; }
          .admin-header input[type="text"] { width: 100% !important; }
        }
      `}</style>
      <div style={{ display: 'flex', minHeight: '100vh', background: A.pageBg }}>
        <AdminNav />
        <main style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>
    </>
  )
}
