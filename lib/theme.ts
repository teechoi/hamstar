// lib/theme.ts — server-safe theme constants (no 'use client')
export const globalStyles = `
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.8)} }
  @keyframes petIdle { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-6px) rotate(2deg)} }
  @keyframes raceBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Pretendard', 'Helvetica Neue', sans-serif; background: #F7F6F3; color: #000000; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
  .site-nav { position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; z-index: 9999 !important; }
  button { font-family: inherit; }
  input { font-family: inherit; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #F7F6F3; }
  ::-webkit-scrollbar-thumb { background: #C8C4D6; border-radius: 3px; }
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
  bg:          '#F7F6F3',
  card:        '#FFFFFF',
  cardAlt:     '#F7F6F3',
  text:        '#000000',
  textMid:     '#8A8A8A',
  textMuted:   '#8A8A8A',
  border:      '#E9E9E9',
  borderDark:  '#D5D5D5',
  borderMid:   '#E0E0E0',

  // Brand
  yellow:      '#FFE790',
  yellowDark:  '#F5D850',
  yellowSoft:  'rgba(255,231,144,0.18)',
  yellowText:  '#000000',
  sub2:        '#503F00',      // text on yellow backgrounds
  sub2Soft:    'rgba(80,63,0,0.3)',

  purple:      '#735DFF',
  purpleSoft:  'rgba(115,93,255,0.08)',
  purpleText:  '#ffffff',

  // Semantic
  coral:       '#FF3B5C',
  coralSoft:   '#FFF0F3',

  win:         '#00C566',      // W pill / success green
  winSoft:     'rgba(0,197,102,0.10)',

  live:        '#FF3B5C',      // LIVE dot / frenzy red

  // Medal colours (race podium)
  medalGold:   '#B8860B',
  medalSilver: '#888888',
  medalBronze: '#A0522D',

  // Shadows — brand-tinted multi-layer stacks (inspired by Sentry/Raycast/Cursor)
  shadowCard:      '0 1px 2px rgba(115,93,255,0.04), 0 6px 16px rgba(115,93,255,0.06), 0 20px 40px rgba(77,67,83,0.07)',
  shadowCardHover: '0 2px 4px rgba(115,93,255,0.06), 0 10px 24px rgba(115,93,255,0.10), 0 28px 56px rgba(77,67,83,0.10)',
  shadowBtnYellow: '0 4px 16px rgba(255,214,67,0.50), 0 2px 6px rgba(255,214,67,0.30)',
  shadowBtnPurple: '0 4px 16px rgba(115,93,255,0.40), 0 2px 6px rgba(115,93,255,0.20)',

  // Nav overlay
  navDark:     'rgba(13,13,20,0.95)',

  // Aliases kept for backwards-compat
  lime:        '#FFE790',
  limeDark:    '#F5D850',
  limeText:    '#000000',
  blue:        '#735DFF',
  blueSoft:    'rgba(115,93,255,0.08)',
  violet:      '#735DFF',
  violetSoft:  'rgba(115,93,255,0.08)',
  green:       '#735DFF',
  greenSoft:   'rgba(115,93,255,0.1)',
}
