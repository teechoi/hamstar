import { A } from './theme'

export default function AdminLoading() {
  return (
    <div className="admin-page">
      {[80, 60, 90, 50, 70].map((w, i) => (
        <div key={i} style={{
          height: 20, borderRadius: 8,
          background: A.border,
          width: `${w}%`, marginBottom: 16,
          animation: 'pulse 1.4s ease-in-out infinite',
          animationDelay: `${i * 0.1}s`,
        }} />
      ))}
    </div>
  )
}
