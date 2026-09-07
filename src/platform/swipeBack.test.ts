import { describe, expect, it } from 'vitest'
import { isSwipeBackBlocked, isSwipeBackGesture } from './swipeBack.ts'

describe('isSwipeBackGesture', () => {
  it('detects a mostly horizontal left swipe', () => {
    expect(isSwipeBackGesture(-80, 12)).toBe(true)
    expect(isSwipeBackGesture(-40, 12)).toBe(false)
    expect(isSwipeBackGesture(-120, 80)).toBe(false)
  })
})

describe('isSwipeBackBlocked', () => {
  it('blocks swipes that start on interactive overlays', () => {
    document.body.innerHTML = `
      <div class="hand-track"><button type="button">Hand 1</button></div>
      <div class="ios27-sheet-backdrop"><div role="dialog">Sheet</div></div>
    `
    expect(isSwipeBackBlocked(document.querySelector('.hand-track button'))).toBe(true)
    expect(isSwipeBackBlocked(document.querySelector('[role="dialog"]'))).toBe(true)
    expect(isSwipeBackBlocked(document.body)).toBe(false)
  })
})
