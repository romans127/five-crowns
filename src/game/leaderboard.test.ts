import { describe, expect, it } from 'vitest'
import { createGame, setHandScore } from './engine.ts'
import { upsertHistory } from './history.ts'
import { buildLeaderboard, isLeaderboardGame, sortByLastPlace, sortByWins } from './leaderboard.ts'

function completeFinishedGame(names: string[], totals: number[]) {
  let game = createGame(names)
  for (let hand = 0; hand < 11; hand += 1) {
    game.players.forEach((player, index) => {
      const total = totals[index] ?? 0
      game = setHandScore(game, hand, player.id, hand === 10 ? total - Math.round(total / 11) * 10 : Math.round(total / 11))
    })
  }
  return upsertHistory({ ...game, status: 'finished' }, { finishedAt: '2026-09-06T12:00:00.000Z' })
}

describe('all-game leaderboard', () => {
  it('counts wins and last place across finished games by player name', () => {
    const game1 = completeFinishedGame(['Ryan', 'Ada'], [110, 0])
    const game2 = completeFinishedGame(['Ryan', 'Ada'], [100, 5])
    const game3 = completeFinishedGame(['Ryan', 'Morgan'], [90, 0])
    const game4 = completeFinishedGame(['Ada', 'Morgan'], [10, 70])

    const board = buildLeaderboard([game1, game2, game3, game4])
    const ada = board.find((entry) => entry.name === 'Ada')
    const ryan = board.find((entry) => entry.name === 'Ryan')
    const morgan = board.find((entry) => entry.name === 'Morgan')

    expect(isLeaderboardGame(game1)).toBe(true)
    expect(ada?.wins).toBe(3)
    expect(ryan?.lastPlace).toBe(3)
    expect(morgan?.lastPlace).toBe(1)
    expect(morgan?.wins).toBe(1)
    expect(sortByWins(board)[0]?.name).toBe('Ada')
    expect(sortByLastPlace(board)[0]?.name).toBe('Ryan')
  })

  it('ignores in-progress games and matches names case-insensitively', () => {
    let game = createGame([' Ryan ', 'Ada'])
    game = setHandScore(game, 0, game.players[0]!.id, 4)
    const partial = upsertHistory(game, { finishedAt: null })

    const finished = completeFinishedGame(['ryan', 'Ada'], [40, 5])
    const board = buildLeaderboard([partial, finished])
    const ryan = board.find((entry) => entry.name === 'ryan')

    expect(board).toHaveLength(2)
    expect(ryan?.gamesPlayed).toBe(1)
    expect(ryan?.wins).toBe(0)
    expect(ryan?.lastPlace).toBe(1)
  })
})
