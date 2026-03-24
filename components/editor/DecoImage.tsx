import { DECOS, type DecoId } from '@/config/decorations'

export function DecoImage({ id, className }: { id: DecoId; className?: string }) {
  const cfg = DECOS[id]
  return (
    <img
      src={cfg.src}
      alt=""
      className={className}
      style={{ position: 'absolute', pointerEvents: 'none', zIndex: 50, ...cfg.style }}
    />
  )
}
