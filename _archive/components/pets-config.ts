// lib/pets-config.ts
// Static config — swap in real wallet addresses before launch

export const PETS_CONFIG = [
  {
    slug: 'hammy',
    name: 'Hammy',
    number: '07',
    emoji: '🐹',
    team: 'RedPaw Racing',
    tagline: 'Lightning in a fur coat',
    color: '#FF3B5C',
    // 🔴 REPLACE with real Solana wallet address
    walletAddress: process.env.HAMMY_WALLET ?? 'HAMMY_WALLET_ADDRESS_PLACEHOLDER',
    speedBase: 88,
    chaosBase: 72,
  },
  {
    slug: 'whiskers',
    name: 'Whiskers',
    number: '03',
    emoji: '🐭',
    team: 'TealWheel',
    tagline: 'Precision. Speed. Cheese.',
    color: '#005DFF',
    // 🔴 REPLACE with real Solana wallet address
    walletAddress: process.env.WHISKERS_WALLET ?? 'WHISKERS_WALLET_ADDRESS_PLACEHOLDER',
    speedBase: 76,
    chaosBase: 45,
  },
  {
    slug: 'nugget',
    name: 'Nugget',
    number: '99',
    emoji: '🐿️',
    team: 'PurpleNut',
    tagline: 'Pure chaotic energy',
    color: '#7A00FF',
    // 🔴 REPLACE with real Solana wallet address
    walletAddress: process.env.NUGGET_WALLET ?? 'NUGGET_WALLET_ADDRESS_PLACEHOLDER',
    speedBase: 91,
    chaosBase: 95,
  },
] as const

export const UPGRADE_CATALOG = [
  // SNACK UPGRADES
  { category: 'SNACK', tier: 'BASIC',     name: 'Sunflower Seeds',      emoji: '🌻', description: 'Standard daily fuel',                    costSol: 0.1,  sortOrder: 1 },
  { category: 'SNACK', tier: 'UPGRADE',   name: 'Premium Veggie Mix',   emoji: '🥦', description: 'Fresh greens for peak performance',       costSol: 0.5,  sortOrder: 2 },
  { category: 'SNACK', tier: 'ELITE',     name: 'Champion Seed Blend',  emoji: '⭐', description: 'Hand-selected racing nutrition',          costSol: 2.0,  sortOrder: 3 },
  { category: 'SNACK', tier: 'LEGENDARY', name: 'Exotic Fruit Tray',    emoji: '🍇', description: 'Exclusive seasonal superfood platter',    costSol: 5.0,  sortOrder: 4 },
  // CAGE UPGRADES
  { category: 'CAGE',  tier: 'BASIC',     name: 'Basic Cage',           emoji: '📦', description: 'Standard starter habitat',               costSol: 0.0,  sortOrder: 1 },
  { category: 'CAGE',  tier: 'UPGRADE',   name: 'Cozy Bedding',         emoji: '🛏️', description: 'Soft premium nesting material',           costSol: 0.5,  sortOrder: 2 },
  { category: 'CAGE',  tier: 'ELITE',     name: 'Adventure Tunnel',     emoji: '🌀', description: 'Enrichment maze & tunnel system',        costSol: 2.0,  sortOrder: 3 },
  { category: 'CAGE',  tier: 'LEGENDARY', name: 'Deluxe Penthouse',     emoji: '🏠', description: 'Multi-level luxury habitat',             costSol: 8.0,  sortOrder: 4 },
] as const
