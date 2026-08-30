import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { createGame, setHandScore } from '../game/engine.ts'
import { HISTORY_KEY, listHistory, upsertHistory } from '../game/history.ts'
import { History } from './History.tsx'

function seedHistory() {
  let game = createGame(['Ryan', 'Ada'])
  game = setHandScore(game, 0, game.players[0]!.id, 12)
  game = setHandScore(game, 0, game.players[1]!.id, 0)
  upsertHistory({ ...game, status: 'finished' }, { finishedAt: '2026-08-30T12:00:00.000Z' })
}

describe('History screen', () => {
  beforeEach(() => {
    localStorage.removeItem(HISTORY_KEY)
  })

  it('lists saved games and opens a score sheet', async () => {
    seedHistory()
    const user = userEvent.setup()
    render(<History onBack={() => undefined} />)

    expect(screen.getByRole('heading', { name: 'Past games' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Ryan, Ada/i }))
    expect(screen.getByRole('heading', { name: 'Game detail' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /Total/i })).toBeInTheDocument()
    expect(listHistory()).toHaveLength(1)
  })
})
