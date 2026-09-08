import { describe, expect, it } from 'vitest'
import { GAMES, searchGames } from './catalog.ts'

describe('searchGames', () => {
  it('returns every game when the query is blank', () => {
    expect(searchGames('')).toEqual(GAMES)
    expect(searchGames('   ')).toEqual(GAMES)
  })

  it('matches name, tagline, blurb, and keywords', () => {
    expect(searchGames('kings').map((game) => game.id)).toEqual(['five-crowns'])
    expect(searchGames('phase leftover').map((game) => game.id)).toEqual(['phase-10'])
    expect(searchGames('uno leftover').map((game) => game.id)).toEqual(['uno'])
    expect(searchGames('yahtzee').map((game) => game.id)).toContain('yahtzee')
    expect(searchGames('scorekeeper').map((game) => game.id)).toEqual(
      expect.arrayContaining([
        'five-crowns',
        'phase-10',
        'uno',
        'yahtzee',
        'cribbage',
        'hearts',
        'gin-rummy',
        'farkle',
        'qwixx',
        'monopoly-deal',
        'sorry',
        'ticket-to-ride',
        'sequence',
      ]),
    )
    expect(searchGames('cribbage').map((game) => game.id)).toEqual(['cribbage'])
    expect(searchGames('queen').map((game) => game.id)).toEqual(['hearts'])
    expect(searchGames('deadwood').map((game) => game.id)).toEqual(['gin-rummy'])
    expect(searchGames('10000').map((game) => game.id)).toEqual(['farkle'])
    expect(searchGames('lockout').map((game) => game.id)).toEqual(['qwixx'])
    expect(searchGames('monopoly deal').map((game) => game.id)).toEqual(['monopoly-deal'])
    expect(searchGames('sorry').map((game) => game.id)).toEqual(['sorry'])
    expect(searchGames('longest').map((game) => game.id)).toEqual(['ticket-to-ride'])
    expect(searchGames('chips').map((game) => game.id)).toEqual(['sequence'])
  })

  it('returns an empty list when nothing matches', () => {
    expect(searchGames('xyzzy-no-game')).toEqual([])
  })
})
