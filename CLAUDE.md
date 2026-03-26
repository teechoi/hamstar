# HamstarHub — Design System Rules for Figma Integration

## Styling Approach

**All styling uses inline `React.CSSProperties` objects.** There is no Tailwind, no CSS Modules, no Styled Components, no shadcn/ui, no external component library.

```tsx
// ✅ Correct pattern
<div style={{ display: 'flex', gap: 16, padding: '24px 32px', borderRadius: 16 }}>

// ❌ Never use Tailwind classes
<div className="flex gap-4 p-6 rounded-2xl">
```

Hover states are handled with `useState`:
```tsx
const [hovered, setHovered] = useState(false);
<button
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
  style={{ transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'all 0.15s ease-out' }}
/>
```

---

## Design Tokens

**Source of truth:** `/lib/theme.ts`

```typescript
export const colors = {
  bg: '#F1F6FF',          // Page background
  card: '#FFFFFF',        // Card background
  cardAlt: '#F7FAFF',     // Alternate card background
  text: '#0A0F1F',        // Primary text
  textMid: '#3A4260',     // Secondary text
  textMuted: '#8892AA',   // Muted/placeholder text
  border: '#E2E8F5',      // Default border
  borderDark: '#C8D4ED',  // Emphasized border

  // Accent colors
  lime: '#A6FF00',        // Primary action / highlight
  limeDark: '#85CC00',    // Lime hover state
  limeText: '#2A4A00',    // Text on lime backgrounds
  blue: '#005DFF',        // Secondary action
  blueSoft: '#EBF0FF',    // Soft blue background
  coral: '#FF3B5C',       // Error / danger
  coralSoft: '#FFF0F3',   // Soft coral background
  violet: '#7A00FF',      // Decorative accent
  violetSoft: '#F3EBFF',  // Soft violet background
  yellow: '#FFD000',      // Warning / highlight
  green: '#00C566',       // Success
  greenSoft: '#E6FFF3',   // Soft green background
};
```

Always import and use `colors` from `/lib/theme.ts` — never hardcode hex values for these tokens.

**Landing page / hero exceptions:** `#0D0D14` (dark bg), `#F5D050` (gold accent) are used only in `/app/page.tsx` and landing components.

---

## Typography

**Font:** Inter (Google Fonts) — loaded in `/app/layout.tsx`
**Weights:** 400, 500, 600, 700, 800, 900
**Fallback:** `'Inter', 'Helvetica Neue', sans-serif`

Apply font weight directly via inline style:
```tsx
<h1 style={{ fontFamily: 'Inter, Helvetica Neue, sans-serif', fontWeight: 800, fontSize: 'clamp(28px, 5vw, 48px)' }} />
<p style={{ fontWeight: 400, fontSize: 14, color: colors.textMuted }} />
```

**Monospace** (Solana addresses, timers): `fontFamily: 'monospace'`

---

## Components

**Location:** `/components/ui/index.tsx`

Available core components:
- `LimeButton` — Primary CTA (lime background, dark text, scale hover)
- `OutlineButton` — Secondary action (border, fills on hover)
- `Tag` — Badge with customizable `bg`, `color`, `border` props
- `RaceBar` — Horizontal progress bar with `pct`, `color`, `label` props
- `LivePulse` — Animated pulsing "LIVE" dot indicator
- `CheckerBar` — Decorative checkerboard divider
- `SolAddress` — Displays + copies Solana wallet address
- `useIsMobile` — Hook, returns `true` if viewport ≤ 768px

When generating code from Figma designs, map Figma components to these first before creating new ones.

---

## Responsive Design

Single breakpoint: **768px** (mobile)

```tsx
const isMobile = useIsMobile(); // from /components/ui/index.tsx
<div style={{ padding: isMobile ? '16px' : '32px 48px' }} />
```

Use `clamp()` for fluid typography/spacing:
```tsx
fontSize: 'clamp(20px, 3vw, 36px)'
padding: 'clamp(16px, 4vw, 48px)'
```

---

## Icons

**No icon library.** Use emoji characters directly in JSX:
- `🐹` Hamster logo
- `✓` Checkmark
- `◎` Solana symbol
- `×` Close/dismiss

---

## Assets

- **Images:** `/public/images/*.png` (36 PNG files)
- **Reference via:** `/images/filename.png` (no optimization — `unoptimized` in next.config.js)
- **CDN:** Cloudinary (`**.cloudinary.com`) for admin-uploaded media

Import images with Next.js `<Image>` or plain `<img>` tag:
```tsx
<img src="/images/hamster-dash.png" alt="Hammy" style={{ width: 120, height: 'auto' }} />
```

---

## Project Structure

```
app/           # Next.js App Router pages & API routes
components/    # React components
  ui/          # Core reusable UI components
  landing/     # Landing page sections
  views/       # Main app views
  editor/      # Decoration editor
lib/           # Utilities (theme.ts, hooks, db clients)
config/        # Site & decoration configuration
public/images/ # Static PNG assets
prisma/        # DB schema
```

Path alias: `@/` maps to project root.

---

## Global Styles

Minimal global CSS injected as a string in `/lib/theme.ts` (`globalStyles`) and via inline `<style>` tags:
- CSS reset: `box-sizing: border-box; margin: 0; padding: 0`
- Body: `background: #F1F6FF; color: #0A0F1F; font-family: Inter`
- Keyframes: `pulse`, `petIdle`, `raceBounce`
- Scrollbar: 6px width
- Selection highlight: `#A6FF0066` (lime tint)

Do not add new global CSS files. Inject additional keyframes via `<style>` tags when needed.

---

## Figma → Code Checklist

When translating a Figma design to code:
1. Map colors to tokens in `/lib/theme.ts`
2. Use inline `React.CSSProperties` — no class names
3. Reuse components from `/components/ui/index.tsx` where applicable
4. Use `useIsMobile()` for responsive behavior
5. Use Inter font weights (no other fonts)
6. Reference existing `/public/images/` assets where possible
7. Hover states via `useState` + `onMouseEnter`/`onMouseLeave`
