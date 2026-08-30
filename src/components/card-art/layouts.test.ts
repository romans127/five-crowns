import { describe, expect, it } from 'vitest'
import { isPipRank, PIP_LAYOUTS } from './layouts.ts'

describe('card pip layouts', () => {
  it('maps number ranks to symmetric pip fields', () => {
    expect(PIP_LAYOUTS[3]).toHaveLength(3)
    expect(PIP_LAYOUTS[10]).toHaveLength(10)
    expect(isPipRank(10)).toBe(true)
    expect(isPipRank(11)).toBe(false)
  })
})
