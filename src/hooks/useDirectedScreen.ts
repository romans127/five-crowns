import { useCallback, useRef, useState } from 'react'

export type SceneTransition = 'forward' | 'back' | 'none'

export function useDirectedScreen<T extends string>(initial: T) {
  const [screen, setScreenState] = useState(initial)
  const [transition, setTransition] = useState<SceneTransition>('none')
  const screenRef = useRef(screen)

  const navigate = useCallback((next: T, direction: SceneTransition = 'forward') => {
    if (next === screenRef.current) {
      return
    }
    setTransition(direction)
    screenRef.current = next
    setScreenState(next)
  }, [])

  const back = useCallback((next: T) => {
    navigate(next, 'back')
  }, [navigate])

  return { screen, transition, navigate, back, setScreen: navigate }
}
