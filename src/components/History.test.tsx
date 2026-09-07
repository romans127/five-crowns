import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import { createGame, setHandScore } from '../game/engine.ts'
import { HISTORY_KEY, listHistory, searchHistory, upsertHistory } from '../game/history.ts'
import { History } from './History.tsx'

function seedHistory() {
  let game = createGame(['Ryan', 'Ada'])
  game = setHandScore(game, 0, game.players[0]!.id, 12)
  game = setHandScore(game, 0, game.players[1]!.id, 0)
  upsertHistory({ ...game, status: 'finished' }, { finishedAt: '2026-08-30T12:00:00.000Z' })
}

function seedInProgressHistory() {
  let game = createGame(['Ryan', 'Ada'])
  game = setHandScore(game, 0, game.players[0]!.id, 5)
  upsertHistory(game, { finishedAt: null })
  return listHistory()[0]!
}

describe('History screen', () => {
  beforeEach(() => {
    cleanup()
    localStorage.removeItem(HISTORY_KEY)
  })

  it('lists saved games and opens a score sheet', async () => {
    seedHistory()
    const user = userEvent.setup()
    render(<History onBack={() => undefined} onResume={() => undefined} />)

    expect(screen.getByRole('heading', { name: 'Past games' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Ryan, Ada/i }))
    expect(screen.getByRole('heading', { name: 'Game detail' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /Total/i })).toBeInTheDocument()
    expect(listHistory()).toHaveLength(1)
  })

  it('filters games by player name', async () => {
    let game = createGame(['Ryan', 'Ada'])
    game = setHandScore(game, 0, game.players[0]!.id, 3)
    game = setHandScore(game, 0, game.players[1]!.id, 0)
    upsertHistory({ ...game, status: 'finished' })

    game = createGame(['Morgan', 'Lee'])
    upsertHistory({ ...game, status: 'finished' })

    const user = userEvent.setup()
    render(<History onBack={() => undefined} onResume={() => undefined} />)

    await user.type(screen.getByRole('searchbox', { name: /search past games/i }), 'Morgan')
    expect(screen.getByRole('button', { name: /Morgan, Lee/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Ryan, Ada/i })).not.toBeInTheDocument()
    expect(searchHistory(listHistory(), 'Morgan')).toHaveLength(1)
  })

  it('offers resume for in-progress games', async () => {
    seedInProgressHistory()
    const onResume = vi.fn()
    const user = userEvent.setup()
    render(<History onBack={() => undefined} onResume={onResume} />)

    await user.click(screen.getByRole('button', { name: /Ryan, Ada/i }))
    const resume = screen.getByRole('button', { name: /resume this table/i })
    expect(resume).toBeInTheDocument()
    await user.click(resume)
    expect(onResume).toHaveBeenCalledWith(expect.objectContaining({ status: 'playing' }))
  })
})
