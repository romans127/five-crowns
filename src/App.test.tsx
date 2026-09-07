import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { createGame, setHandScore } from './game/engine.ts'
import { HISTORY_KEY, upsertHistory } from './game/history.ts'
import { STORAGE_KEY } from './game/storage.ts'
import App from './App.tsx'

function swipeLeft(element: Element) {
  fireEvent.touchStart(element, { touches: [{ clientX: 220, clientY: 120 }] })
  fireEvent.touchEnd(element, { changedTouches: [{ clientX: 120, clientY: 125 }] })
}

function swipeBackShell() {
  const shell = document.querySelector('.swipe-back-shell')
  if (!shell) {
    throw new Error('Expected a swipe-back shell')
  }
  return shell
}

describe('Game Night', () => {
  beforeEach(() => {
    cleanup()
    localStorage.removeItem(HISTORY_KEY)
    localStorage.removeItem(STORAGE_KEY)
  })

  it('starts on a game picker', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Game Night' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /kings go wild/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /complete every phase/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /complete every phase/i }))
    expect(screen.getByRole('heading', { name: 'Phase 10' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /all games/i }))
    expect(screen.getByRole('heading', { name: 'Game Night' })).toBeInTheDocument()
  })

  it('filters game cards by search', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByRole('searchbox', { name: /search games/i }), 'phase')
    expect(screen.getByRole('button', { name: /complete every phase/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /kings go wild/i })).not.toBeInTheDocument()

    await user.clear(screen.getByRole('searchbox', { name: /search games/i }))
    await user.type(screen.getByRole('searchbox', { name: /search games/i }), 'cribbage')
    expect(screen.getByText(/no games match “cribbage”/i)).toBeInTheDocument()
  })
})

describe('Five Crowns scorekeeper', () => {
  beforeEach(() => {
    cleanup()
    localStorage.removeItem(HISTORY_KEY)
    localStorage.removeItem(STORAGE_KEY)
  })

  async function openFiveCrowns(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('button', { name: /kings go wild/i }))
  }

  it('starts a game, records leftovers, and opens the rules', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openFiveCrowns(user)

    expect(screen.getByRole('heading', { name: 'Five Crowns' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /deal a new game/i }))
    await user.type(screen.getByLabelText('Player 1 name'), 'Ryan')
    await user.type(screen.getByLabelText('Player 2 name'), 'Ada')
    await user.click(screen.getByRole('button', { name: /shuffle up and deal/i }))

    expect(screen.getByRole('heading', { name: /3s are wild/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /ryan/i }))
    let pad = screen.getByRole('dialog', { name: /leftovers this hand/i })
    await user.click(within(pad).getByRole('tab', { name: 'Keypad' }))
    await user.click(within(pad).getByRole('button', { name: '9' }))
    await user.click(within(pad).getByRole('button', { name: /lock in 9/i }))
    expect(screen.getByRole('button', { name: /ryan.*total 9/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /ada/i }))
    pad = screen.getByRole('dialog', { name: /leftovers this hand/i })
    expect(within(pad).getByRole('tab', { name: 'Keypad', selected: true })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Rules' }))
    expect(screen.getByRole('heading', { name: /how five crowns works/i })).toBeInTheDocument()
    expect(screen.getByText(/six jokers/i)).toBeInTheDocument()
    expect(screen.getByText(/kings when 13 cards are dealt/i)).toBeInTheDocument()
  })

  it('always offers past games from the home screen', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openFiveCrowns(user)

    expect(screen.getByRole('button', { name: /^past games/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^past games/i }))
    expect(screen.getByRole('heading', { name: 'Past games' })).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: /search past games/i })).toBeInTheDocument()
  })

  it('resumes an accidentally ended game from history', async () => {
    let game = createGame(['Ryan', 'Ada'])
    game = setHandScore(game, 0, game.players[0]!.id, 7)
    upsertHistory(game, { finishedAt: null })

    const user = userEvent.setup()
    render(<App />)
    await openFiveCrowns(user)

    await user.click(screen.getByRole('button', { name: /^past games/i }))
    await user.click(screen.getByRole('button', { name: /Ryan, Ada/i }))
    await user.click(screen.getByRole('button', { name: /resume this table/i }))

    expect(screen.getByRole('heading', { name: /3s are wild/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ryan.*total 7/i })).toBeInTheDocument()
  })

  it('opens the all-game leaderboard from home', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openFiveCrowns(user)

    await user.click(screen.getByRole('button', { name: /hall of crowns/i }))
    expect(screen.getByRole('heading', { name: 'Hall of crowns' })).toBeInTheDocument()
    expect(screen.getByText(/no completed games yet/i)).toBeInTheDocument()
  })

  it('swipes back from setup to home', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openFiveCrowns(user)

    await user.click(screen.getByRole('button', { name: /deal a new game/i }))
    expect(screen.getByRole('heading', { name: /who.*at the table/i })).toBeInTheDocument()

    swipeLeft(swipeBackShell())
    expect(screen.getByRole('heading', { name: 'Five Crowns' })).toBeInTheDocument()
  })

  it('swipes back from game home to the picker', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openFiveCrowns(user)

    swipeLeft(swipeBackShell())
    expect(screen.getByRole('heading', { name: 'Game Night' })).toBeInTheDocument()
  })

  it('swipes back from history detail to the list', async () => {
    let game = createGame(['Ryan', 'Ada'])
    game = setHandScore(game, 0, game.players[0]!.id, 7)
    upsertHistory(game, { finishedAt: null })

    const user = userEvent.setup()
    render(<App />)
    await openFiveCrowns(user)

    await user.click(screen.getByRole('button', { name: /^past games/i }))
    await user.click(screen.getByRole('button', { name: /Ryan, Ada/i }))
    expect(screen.getByRole('heading', { name: 'Game detail' })).toBeInTheDocument()

    swipeLeft(swipeBackShell())
    expect(screen.getByRole('heading', { name: 'Past games' })).toBeInTheDocument()
  })
})
