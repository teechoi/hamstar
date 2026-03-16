// lib/theme.ts — server-safe theme constants (no 'use client')
export const globalStyles = `
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.8)} }
  @keyframes petIdle { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-6px) rotate(2deg)} }
  @keyframes raceBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', 'Helvetica Neue', sans-serif; background: #F1F6FF; color: #0A0F1F; }
  .site-nav { position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; z-index: 9999 !important; }
  button { font-family: inherit; }
  input { font-family: inherit; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #F1F6FF; }
  ::-webkit-scrollbar-thumb { background: #C8D4ED; border-radius: 3px; }
  ::selection { background: #A6FF0066; }
  .admin-page { padding: 32px 28px; }
  .admin-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  @media (max-width: 767px) {
    input[type="text"], input[type="email"] { width: 100% !important; }
    .admin-page { padding: 20px 16px; }
    .admin-2col { grid-template-columns: 1fr !important; gap: 14px !important; }
  }
`
export const T = {
  bg: '#F1F6FF',
  card: '#FFFFFF',
  cardAlt: '#F7FAFF',
  text: '#0A0F1F',
  textMid: '#3A4260',
  textMuted: '#8892AA',
  border: '#E2E8F5',
  borderDark: '#C8D4ED',
  lime: '#A6FF00',
  limeDark: '#85CC00',
  limeText: '#2A4A00',
  blue: '#005DFF',
  blueSoft: '#EBF0FF',
  coral: '#FF3B5C',
  coralSoft: '#FFF0F3',
  violet: '#7A00FF',
  violetSoft: '#F3EBFF',
  yellow: '#FFD000',
  green: '#00C566',
  greenSoft: '#E6FFF3',
}
