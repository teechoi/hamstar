// lib/theme.ts — server-safe theme constants (no 'use client')
export const globalStyles = `
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.8)} }
  @keyframes petIdle { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-6px) rotate(2deg)} }
  @keyframes raceBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Pretendard', 'Helvetica Neue', sans-serif; background: #F8F9FA; color: #000000; }
  .site-nav { position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; z-index: 9999 !important; }
  button { font-family: inherit; }
  input { font-family: inherit; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #F8F9FA; }
  ::-webkit-scrollbar-thumb { background: #D5D5D5; border-radius: 3px; }
  ::selection { background: rgba(115,93,255,0.2); }
  .admin-page { padding: 32px 28px; }
  .admin-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  @media (max-width: 767px) {
    input[type="text"], input[type="email"] { width: 100% !important; }
    .admin-page { padding: 20px 16px; }
    .admin-2col { grid-template-columns: 1fr !important; gap: 14px !important; }
  }
`
export const T = {
  // Base
  bg: '#F8F9FA',
  card: '#FFFFFF',
  cardAlt: '#F8F9FA',
  text: '#000000',
  textMid: '#8A8A8A',
  textMuted: '#8A8A8A',
  border: '#E9E9E9',
  borderDark: '#D5D5D5',
  // Brand
  yellow: '#FFE790',
  purple: '#735DFF',
  sub2: '#503F00',
  // Semantic aliases (used by existing components)
  lime: '#FFE790',
  limeDark: '#F5D850',
  limeText: '#000000',
  blue: '#735DFF',
  blueSoft: 'rgba(115,93,255,0.08)',
  coral: '#FF3B5C',
  coralSoft: '#FFF0F3',
  violet: '#735DFF',
  violetSoft: 'rgba(115,93,255,0.08)',
  green: '#735DFF',
  greenSoft: 'rgba(115,93,255,0.1)',
}
