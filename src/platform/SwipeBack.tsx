import { useRef, type ReactNode } from 'react'
import { useSwipeBack } from '../hooks/useSwipeBack.ts'

type SwipeBackProps = {
  children: ReactNode
  onBack: () => void
  enabled?: boolean
  className?: string
}

export function SwipeBack({ children, onBack, enabled = true, className }: SwipeBackProps) {
  const ref = useRef<HTMLDivElement>(null)
  useSwipeBack(ref, onBack, enabled)

  return (
    <div ref={ref} className={className ?? 'swipe-back-shell'}>
      {children}
    </div>
  )
}
