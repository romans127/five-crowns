import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { createGame, setHandScore } from './game/engine.ts'
import { HISTORY_KEY, upsertHistory } from './game/history.ts'
import { STORAGE_KEY } from './game/storage.ts'
import App from './App.tsx'

describe('Five Crowns scorekeeper', () => {
  beforeEach(() => {
    cleanup()
    localStorage.removeItem(HISTORY_KEY)
    localStorage.removeItem(STORAGE_KEY)
  })
  it('starts a game, records leftovers, and opens the rules', async () => {
    const user = userEvent.setup()
    render(<App />)

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

    await user.click(screen.getByRole('button', { name: /^past games/i }))
    await user.click(screen.getByRole('button', { name: /Ryan, Ada/i }))
    await user.click(screen.getByRole('button', { name: /resume this table/i }))

    expect(screen.getByRole('heading', { name: /3s are wild/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ryan.*total 7/i })).toBeInTheDocument()
  })

  it('opens the all-game leaderboard from home', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /hall of crowns/i }))
    expect(screen.getByRole('heading', { name: 'Hall of crowns' })).toBeInTheDocument()
    expect(screen.getByText(/no completed games yet/i)).toBeInTheDocument()
  })
})
