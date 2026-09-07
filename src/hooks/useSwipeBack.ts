import { useEffect, type RefObject } from 'react'
import { isSwipeBackBlocked, isSwipeBackGesture } from '../platform/swipeBack.ts'

export function useSwipeBack(
  containerRef: RefObject<HTMLElement | null>,
  onBack: () => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) {
      return
    }

    const node = containerRef.current
    if (!node) {
      return
    }

    let startX = 0
    let startY = 0
    let tracking = false

    const onTouchStart = (event: TouchEvent) => {
      if (isSwipeBackBlocked(event.target)) {
        tracking = false
        return
      }
      const touch = event.touches[0]
      if (!touch) {
        return
      }
      startX = touch.clientX
      startY = touch.clientY
      tracking = true
    }

    const onTouchEnd = (event: TouchEvent) => {
      if (!tracking) {
        return
      }
      tracking = false
      const touch = event.changedTouches[0]
      if (!touch) {
        return
      }
      const dx = touch.clientX - startX
      const dy = touch.clientY - startY
      if (isSwipeBackGesture(dx, dy)) {
        onBack()
      }
    }

    node.addEventListener('touchstart', onTouchStart, { passive: true })
    node.addEventListener('touchend', onTouchEnd, { passive: true })
    node.addEventListener('touchcancel', onTouchEnd, { passive: true })

    return () => {
      node.removeEventListener('touchstart', onTouchStart)
      node.removeEventListener('touchend', onTouchEnd)
      node.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [containerRef, enabled, onBack])
}
