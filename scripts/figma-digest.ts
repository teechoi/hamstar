/**
 * figma-digest — extract spacing, layout, typography and colors from a Figma frame
 *
 * Usage:
 *   FIGMA_TOKEN=xxx npx tsx scripts/figma-digest.ts <figma-url-or-node-id>
 *   FIGMA_TOKEN=xxx npx tsx scripts/figma-digest.ts <figma-url> --depth 3
 *   FIGMA_TOKEN=xxx npx tsx scripts/figma-digest.ts <figma-url> --json   (raw JSON)
 *
 * The file key is read from the URL. The node-id can be in the URL (?node-id=52-244)
 * or supplied directly as e.g. "52:244".
 *
 * Example:
 *   FIGMA_TOKEN=figd_xxx npx tsx scripts/figma-digest.ts \
 *     "https://www.figma.com/design/FILE_KEY/...?node-id=52-244"
 */

import https from 'https'

// ─── CLI args ────────────────────────────────────────────────────────────────

const TOKEN = process.env.FIGMA_TOKEN || ''
const args = process.argv.slice(2)
const rawTarget = args.find(a => !a.startsWith('--')) ?? ''
const maxDepth = (() => { const i = args.indexOf('--depth'); return i !== -1 ? parseInt(args[i + 1], 10) : 99 })()
const jsonMode = args.includes('--json')

if (!TOKEN) {
  console.error('\nError: set FIGMA_TOKEN env variable\n  FIGMA_TOKEN=figd_xxx npx tsx scripts/figma-digest.ts <url>\n')
  process.exit(1)
}
if (!rawTarget) {
  console.error('\nUsage: FIGMA_TOKEN=xxx npx tsx scripts/figma-digest.ts <figma-url-or-nodeId>\n')
  process.exit(1)
}

// ─── URL parsing ─────────────────────────────────────────────────────────────

function parseTarget(input: string): { fileKey: string; nodeId: string } {
  // Try full URL
  const urlMatch = input.match(/figma\.com\/(?:design|file)\/([^/?#]+)/)
  const nodeMatch = input.match(/[?&]node-id=([^&]+)/)
  if (urlMatch) {
    const fileKey = urlMatch[1]
    const nodeId = nodeMatch ? decodeURIComponent(nodeMatch[1]).replace(/-/, ':') : ''
    return { fileKey, nodeId }
  }
  // Bare node id like "52:244" — need file key from env or fail
  const fileKey = process.env.FIGMA_FILE_KEY ?? ''
  if (!fileKey) {
    console.error('Could not extract file key from input. Supply a full Figma URL.')
    process.exit(1)
  }
  return { fileKey, nodeId: input.replace(/-/, ':') }
}

// ─── Figma API ────────────────────────────────────────────────────────────────

function get(path: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get(
      { hostname: 'api.figma.com', path, headers: { 'X-Figma-Token': TOKEN } },
      res => {
        let buf = ''
        res.on('data', c => (buf += c))
        res.on('end', () => { try { resolve(JSON.parse(buf)) } catch (e) { reject(e) } })
      }
    ).on('error', reject)
  })
}

// ─── Color helpers ────────────────────────────────────────────────────────────

function toHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('')
}

function colorStr(color: any, opacity = 1) {
  if (!color) return null
  const hex = toHex(color.r, color.g, color.b)
  const a = (color.a ?? 1) * opacity
  return a < 0.99 ? `rgba(${Math.round(color.r*255)},${Math.round(color.g*255)},${Math.round(color.b*255)},${a.toFixed(2)})` : hex
}

function fillStr(fills: any[]): string | null {
  if (!fills?.length) return null
  const f = fills.find(f => f.visible !== false)
  if (!f) return null
  if (f.type === 'SOLID') return colorStr(f.color, f.opacity) ?? null
  if (f.type === 'GRADIENT_LINEAR') {
    const stops = f.gradientStops?.map((s: any) => colorStr(s.color)).join(' → ')
    return `gradient(${stops})`
  }
  return f.type
}

// ─── Layout helpers ──────────────────────────────────────────────────────────

function alignItems(v: string) {
  return { CENTER: 'center', MIN: 'flex-start', MAX: 'flex-end', BASELINE: 'baseline', STRETCH: 'stretch' }[v] ?? v
}
function justifyContent(v: string) {
  return { CENTER: 'center', MIN: 'flex-start', MAX: 'flex-end', SPACE_BETWEEN: 'space-between' }[v] ?? v
}
function sizingMode(v: string) {
  return { FIXED: 'fixed', HUG: 'hug-contents', FILL: 'fill-container' }[v] ?? v
}

// ─── Node → Spec ─────────────────────────────────────────────────────────────

interface Spec {
  name: string
  type: string
  visible?: boolean
  // dimensions
  width?: number
  height?: number
  widthSizing?: string
  heightSizing?: string
  // position (absolute layout)
  x?: number
  y?: number
  // flex / auto-layout
  flex?: {
    direction: string
    gap: number
    paddingTop: number
    paddingRight: number
    paddingBottom: number
    paddingLeft: number
    alignItems: string
    justifyContent: string
    wrap: boolean
  }
  // visual
  background?: string | null
  border?: string | null
  borderRadius?: number | number[] | null
  opacity?: number
  blur?: string | null
  shadow?: string | null
  // text
  text?: {
    content: string
    fontFamily: string
    fontSize: number
    fontWeight: number
    lineHeight: number | string
    letterSpacing: number
    color: string | null
    align: string
    truncate?: boolean
  }
  // children
  children?: Spec[]
}

function nodeToSpec(node: any, depth = 0): Spec | null {
  if (depth > maxDepth) return null
  if (node.visible === false) return null

  const spec: Spec = { name: node.name, type: node.type }

  // Dimensions
  if (node.absoluteBoundingBox) {
    spec.width  = Math.round(node.absoluteBoundingBox.width)
    spec.height = Math.round(node.absoluteBoundingBox.height)
  }
  if (node.primaryAxisSizingMode) spec.widthSizing  = sizingMode(node.primaryAxisSizingMode === 'FIXED' ? 'FIXED' : node.primaryAxisSizingMode)
  if (node.counterAxisSizingMode) spec.heightSizing = sizingMode(node.counterAxisSizingMode)
  if (node.layoutSizingHorizontal) spec.widthSizing  = sizingMode(node.layoutSizingHorizontal)
  if (node.layoutSizingVertical)   spec.heightSizing = sizingMode(node.layoutSizingVertical)

  // Relative position from parent (useful for absolute layouts)
  if (node.relativeTransform) {
    spec.x = Math.round(node.relativeTransform[0][2])
    spec.y = Math.round(node.relativeTransform[1][2])
  }

  // Auto layout → flex
  if (node.layoutMode && node.layoutMode !== 'NONE') {
    spec.flex = {
      direction:      node.layoutMode === 'HORIZONTAL' ? 'row' : 'column',
      gap:            node.itemSpacing ?? 0,
      paddingTop:     node.paddingTop ?? 0,
      paddingRight:   node.paddingRight ?? 0,
      paddingBottom:  node.paddingBottom ?? 0,
      paddingLeft:    node.paddingLeft ?? 0,
      alignItems:     alignItems(node.counterAxisAlignItems ?? ''),
      justifyContent: justifyContent(node.primaryAxisAlignItems ?? ''),
      wrap:           node.layoutWrap === 'WRAP',
    }
  }

  // Background / fill
  spec.background = fillStr(node.fills)

  // Border / stroke
  if (node.strokes?.length) {
    const s = node.strokes.find((s: any) => s.visible !== false)
    if (s?.type === 'SOLID') {
      spec.border = `${node.strokeWeight ?? 1}px solid ${colorStr(s.color)}`
    }
  }

  // Border radius
  if (node.cornerRadius != null) {
    spec.borderRadius = node.cornerRadius
  } else if (node.rectangleCornerRadii) {
    spec.borderRadius = node.rectangleCornerRadii // [tl, tr, br, bl]
  }

  // Opacity
  if (node.opacity != null && node.opacity < 1) spec.opacity = node.opacity

  // Effects
  const shadow = node.effects?.find((e: any) => e.type === 'DROP_SHADOW' && e.visible !== false)
  if (shadow) {
    spec.shadow = `${shadow.offset.x}px ${shadow.offset.y}px ${shadow.radius}px ${shadow.spread ?? 0}px ${colorStr(shadow.color)}`
  }
  const blur = node.effects?.find((e: any) => e.type === 'LAYER_BLUR' && e.visible !== false)
  if (blur) spec.blur = `blur(${blur.radius}px)`

  // Text
  if (node.type === 'TEXT') {
    const s = node.style ?? {}
    spec.text = {
      content:       node.characters ?? '',
      fontFamily:    s.fontFamily ?? '',
      fontSize:      s.fontSize ?? 0,
      fontWeight:    s.fontWeight ?? 400,
      lineHeight:    s.lineHeightUnit === 'AUTO' ? 'auto' : (s.lineHeightPx ?? 'auto'),
      letterSpacing: s.letterSpacing ?? 0,
      color:         fillStr(node.fills),
      align:         (s.textAlignHorizontal ?? 'LEFT').toLowerCase(),
    }
  }

  // Children
  if (node.children?.length) {
    const kids = node.children
      .map((c: any) => nodeToSpec(c, depth + 1))
      .filter(Boolean) as Spec[]
    if (kids.length) spec.children = kids
  }

  return spec
}

// ─── Print helpers ────────────────────────────────────────────────────────────

const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  cyan:   '\x1b[36m',
  yellow: '\x1b[33m',
  green:  '\x1b[32m',
  magenta:'\x1b[35m',
  blue:   '\x1b[34m',
  gray:   '\x1b[90m',
}

function row(label: string, value: string | number | null | undefined, color = C.reset) {
  if (value == null || value === '' || value === 0) return
  const pad = '  '
  console.log(`${pad}${C.dim}${label.padEnd(18)}${C.reset}${color}${value}${C.reset}`)
}

function printSpec(spec: Spec, depth = 0) {
  if (!spec) return
  const ind = '  '.repeat(depth)
  const typeColor = spec.type === 'TEXT' ? C.yellow : spec.type === 'FRAME' || spec.type === 'COMPONENT' ? C.cyan : C.magenta
  console.log(`\n${ind}${typeColor}${C.bold}[${spec.type}]${C.reset} ${C.bold}"${spec.name}"${C.reset}`)

  const ind2 = ind + '  '
  const r = (label: string, value: any, color = C.green) => {
    if (value == null || value === '' || (value === 0 && label !== 'gap')) return
    console.log(`${ind2}${C.dim}${label.padEnd(18)}${C.reset}${color}${value}${C.reset}`)
  }

  // Size & position
  if (spec.width != null) r('size', `${spec.width} × ${spec.height}px`)
  if (spec.widthSizing || spec.heightSizing) {
    r('sizing', `w:${spec.widthSizing ?? '?'} h:${spec.heightSizing ?? '?'}`, C.blue)
  }
  if (spec.x != null || spec.y != null) r('position', `x:${spec.x} y:${spec.y}`, C.gray)

  // Auto layout
  if (spec.flex) {
    const f = spec.flex
    r('flex', `${f.direction}${f.wrap ? ' wrap' : ''}`, C.cyan)
    r('gap', `${f.gap}px`, C.cyan)
    r('padding', `top:${f.paddingTop} right:${f.paddingRight} bottom:${f.paddingBottom} left:${f.paddingLeft}`, C.cyan)
    r('align-items', f.alignItems, C.cyan)
    r('justify', f.justifyContent, C.cyan)
  }

  // Visual
  if (spec.background) r('background', spec.background)
  if (spec.border)     r('border', spec.border)
  if (spec.borderRadius != null) {
    const br = Array.isArray(spec.borderRadius)
      ? `tl:${spec.borderRadius[0]} tr:${spec.borderRadius[1]} br:${spec.borderRadius[2]} bl:${spec.borderRadius[3]}`
      : `${spec.borderRadius}px`
    r('borderRadius', br)
  }
  if (spec.opacity != null) r('opacity', spec.opacity, C.gray)
  if (spec.shadow) r('box-shadow', spec.shadow)
  if (spec.blur)   r('backdrop-filter', spec.blur)

  // Typography
  if (spec.text) {
    const t = spec.text
    r('font', `${t.fontFamily} ${t.fontWeight} ${t.fontSize}px`)
    const lh = typeof t.lineHeight === 'number' ? `${Math.round(t.lineHeight)}px` : t.lineHeight
    if (lh !== 'auto') r('line-height', lh)
    if (t.letterSpacing) r('letter-spacing', `${t.letterSpacing}px`)
    r('text-align', t.align)
    if (t.color) r('color', t.color)
    const preview = t.content.replace(/\n/g, ' ').slice(0, 60)
    r('content', `"${preview}${t.content.length > 60 ? '…' : ''}"`, C.yellow)
  }

  // Children
  spec.children?.forEach(child => printSpec(child, depth + 1))
}

// ─── CSS summary ──────────────────────────────────────────────────────────────

function printCSS(spec: Spec, depth = 0) {
  if (!spec) return
  const hasLayout   = !!spec.flex
  const hasVisual   = spec.background || spec.border || spec.borderRadius != null || spec.shadow
  const hasTypo     = !!spec.text
  const hasChildren = !!spec.children?.length

  if (!hasLayout && !hasVisual && !hasTypo) {
    spec.children?.forEach(c => printCSS(c, depth))
    return
  }

  const slug = spec.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  console.log(`\n/* ${spec.name} */`)
  console.log(`/* .${slug} */`)
  console.log('{')

  if (hasLayout) {
    const f = spec.flex!
    console.log(`  display: flex;`)
    console.log(`  flex-direction: ${f.direction};`)
    if (f.wrap) console.log(`  flex-wrap: wrap;`)
    if (f.gap) console.log(`  gap: ${f.gap}px;`)
    const pt=f.paddingTop, pr=f.paddingRight, pb=f.paddingBottom, pl=f.paddingLeft
    if (pt||pr||pb||pl) {
      if (pt===pb && pr===pl) {
        console.log(`  padding: ${pt}px ${pr}px;`)
      } else {
        console.log(`  padding: ${pt}px ${pr}px ${pb}px ${pl}px;`)
      }
    }
    if (f.alignItems)     console.log(`  align-items: ${f.alignItems};`)
    if (f.justifyContent) console.log(`  justify-content: ${f.justifyContent};`)
  }

  if (spec.width)  console.log(`  width: ${spec.width}px;  /* ${spec.widthSizing ?? 'fixed'} */`)
  if (spec.height) console.log(`  height: ${spec.height}px;  /* ${spec.heightSizing ?? 'fixed'} */`)

  if (spec.background) console.log(`  background: ${spec.background};`)
  if (spec.border)     console.log(`  border: ${spec.border};`)
  if (spec.borderRadius != null) {
    const br = Array.isArray(spec.borderRadius) ? spec.borderRadius.join('px ') + 'px' : `${spec.borderRadius}px`
    console.log(`  border-radius: ${br};`)
  }
  if (spec.shadow) console.log(`  box-shadow: ${spec.shadow};`)
  if (spec.blur)   console.log(`  backdrop-filter: ${spec.blur};`)
  if (spec.opacity != null) console.log(`  opacity: ${spec.opacity};`)

  if (hasTypo) {
    const t = spec.text!
    console.log(`  font-family: ${t.fontFamily === 'Kanit' ? "var(--font-kanit), sans-serif" : "'Pretendard', sans-serif"};`)
    console.log(`  font-size: ${t.fontSize}px;`)
    console.log(`  font-weight: ${t.fontWeight};`)
    if (typeof t.lineHeight === 'number') console.log(`  line-height: ${Math.round(t.lineHeight)}px;`)
    if (t.letterSpacing) console.log(`  letter-spacing: ${t.letterSpacing}px;`)
    if (t.align !== 'left') console.log(`  text-align: ${t.align};`)
    if (t.color) console.log(`  color: ${t.color};`)
  }

  console.log('}')

  spec.children?.forEach(c => printCSS(c, depth + 1))
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const { fileKey, nodeId } = parseTarget(rawTarget)

  if (!nodeId) {
    console.error('No node-id found in URL. Include ?node-id=XX-YY in the Figma URL.')
    process.exit(1)
  }

  console.log(`\n${C.bold}Fetching Figma frame...${C.reset}`)
  console.log(`  File : ${fileKey}`)
  console.log(`  Node : ${nodeId}`)

  const apiNodeId = nodeId.replace(':', '-')
  const data = await get(`/v1/files/${fileKey}/nodes?ids=${apiNodeId}&geometry=paths`)

  if (data.err || data.status === 403) {
    console.error('\nFigma API error:', data.err || data.message)
    process.exit(1)
  }

  const nodeKey = Object.keys(data.nodes ?? {})[0]
  const nodeDoc = data.nodes?.[nodeKey]?.document

  if (!nodeDoc) {
    console.error('\nNode not found. Check file key and node-id.')
    process.exit(1)
  }

  if (jsonMode) {
    console.log(JSON.stringify(nodeDoc, null, 2))
    return
  }

  const spec = nodeToSpec(nodeDoc)
  if (!spec) { console.log('Empty spec'); return }

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`${C.bold}DESIGN SPEC — "${spec.name}"${C.reset}`)
  console.log('═'.repeat(60))
  printSpec(spec)

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`${C.bold}CSS TRANSLATION${C.reset}`)
  console.log('═'.repeat(60))
  printCSS(spec)

  console.log('\n')
}

main().catch(e => { console.error(e); process.exit(1) })
