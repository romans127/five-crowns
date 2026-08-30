export type PadMode = 'cards' | 'keypad'

export const PAD_MODE_KEY = 'five-crowns:pad-mode'

export function loadPadMode(storage: Pick<Storage, 'getItem'> = localStorage): PadMode {
  try {
    const raw = storage.getItem(PAD_MODE_KEY)
    if (raw === 'keypad' || raw === 'cards') {
      return raw
    }
  } catch {
    // ignore
  }
  return 'cards'
}

export function savePadMode(mode: PadMode, storage: Pick<Storage, 'setItem'> = localStorage): void {
  storage.setItem(PAD_MODE_KEY, mode)
}
