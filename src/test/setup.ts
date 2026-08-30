import '@testing-library/jest-dom/vitest'
import { beforeEach } from 'vitest'

const memory = new Map<string, string>()

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value)
    },
    removeItem: (key: string) => {
      memory.delete(key)
    },
    clear: () => {
      memory.clear()
    },
  },
})

beforeEach(() => {
  memory.clear()
})
