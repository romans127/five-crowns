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
    expect(searchGames('scorekeeper').map((game) => game.id)).toEqual(['five-crowns', 'phase-10'])
  })

  it('returns an empty list when nothing matches', () => {
    expect(searchGames('cribbage')).toEqual([])
  })
})
