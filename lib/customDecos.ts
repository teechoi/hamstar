export interface CustomDeco {
  id: string
  src: string
  label: string
  left: number
  top: number
  width: number
}

export const LS_CUSTOM = 'hstar_custom_decos'

export function loadCustomDecos(): CustomDeco[] {
  try {
    const v = localStorage.getItem(LS_CUSTOM)
    return v ? JSON.parse(v) : []
  } catch { return [] }
}

export function saveCustomDecos(decos: CustomDeco[]) {
  try {
    localStorage.setItem(LS_CUSTOM, JSON.stringify(decos))
    window.dispatchEvent(new Event('hstar-custom'))
  } catch {}
}
