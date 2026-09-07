import { cleanup, render, screen } from '@testing-library/react'
import { describe, expect, it, beforeEach } from 'vitest'
import { createGame, setHandScore } from '../game/engine.ts'
import { HISTORY_KEY, upsertHistory } from '../game/history.ts'
import { Leaderboard } from './Leaderboard.tsx'

function completeFinishedGame(names: string[], totals: number[]) {
  let game = createGame(names)
  for (let hand = 0; hand < 11; hand += 1) {
    game.players.forEach((player, index) => {
      const total = totals[index] ?? 0
      game = setHandScore(game, hand, player.id, hand === 10 ? total - Math.round(total / 11) * 10 : Math.round(total / 11))
    })
  }
  upsertHistory({ ...game, status: 'finished' }, { finishedAt: '2026-09-06T12:00:00.000Z' })
}

describe('Leaderboard screen', () => {
  beforeEach(() => {
    cleanup()
    localStorage.removeItem(HISTORY_KEY)
  })

  it('shows crown and last-place leaderboards', () => {
    completeFinishedGame(['Ryan', 'Ada'], [110, 0])
    completeFinishedGame(['Ryan', 'Ada'], [100, 5])

    render(<Leaderboard onBack={() => undefined} />)

    expect(screen.getByRole('heading', { name: 'Hall of crowns' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Most crowns' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Most last place' })).toBeInTheDocument()
    expect(screen.getByText('Ada')).toBeInTheDocument()
    expect(screen.getByText('Ryan')).toBeInTheDocument()
  })
})
