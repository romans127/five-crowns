const SWIPE_BLOCK_SELECTOR =
  '.ios27-sheet-backdrop, [role="dialog"], .hand-track, input, textarea, .ios27-searchbar, .ios27-segmented, .keypad'

export function isSwipeBackGesture(dx: number, dy: number, minDistance = 72, maxVertical = 64) {
  return dx <= -minDistance && Math.abs(dy) <= maxVertical
}

export function isSwipeBackBlocked(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return false
  }
  return Boolean(target.closest(SWIPE_BLOCK_SELECTOR))
}
