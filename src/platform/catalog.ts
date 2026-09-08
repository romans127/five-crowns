import type { GameId } from './types.ts'

export type GameDefinition = {
  id: GameId
  name: string
  tagline: string
  blurb: string
  theme: GameId
  keywords: string[]
}

export const GAMES: GameDefinition[] = [
  {
    id: 'five-crowns',
    name: 'Five Crowns',
    tagline: 'Kings go wild',
    blurb: 'Eleven hands, a climbing wild, leftover cards, and a crown for the lowest total.',
    theme: 'five-crowns',
    keywords: ['rummy', 'wilds', 'leftovers', 'cards', 'scorekeeper', 'kings'],
  },
  {
    id: 'phase-10',
    name: 'Phase 10',
    tagline: 'Complete every phase',
    blurb: 'Ten phases, leftover points, and a race to finish Phase 10 with the lowest score.',
    theme: 'phase-10',
    keywords: ['phases', 'leftovers', 'rummy', 'scorekeeper', 'sets', 'runs'],
  },
  {
    id: 'yahtzee',
    name: 'Yahtzee',
    tagline: 'Go for Yahtzee',
    blurb: 'Thirteen boxes, a 63-for-35 upper bonus, and a crown for the highest grand total.',
    theme: 'yahtzee',
    keywords: ['dice', 'scorecard', 'yahtzee', 'bonus', 'scorekeeper', 'straights'],
  },
  {
    id: 'uno',
    name: 'UNO',
    tagline: 'First to 500',
    blurb: 'Yell UNO, score leftover cards, and race to 500 the official Mattel way.',
    theme: 'uno',
    keywords: ['uno', 'wilds', 'leftovers', 'cards', 'scorekeeper', 'skip', 'reverse', 'draw', '500'],
  },
  {
    id: 'cribbage',
    name: 'Cribbage',
    tagline: 'Race to 121',
    blurb: 'Peg each hand — pegging, crib, and the show — and race the board to 121.',
    theme: 'cribbage',
    keywords: ['cribbage', 'pegs', 'board', 'crib', 'nobs', 'fifteens', 'scorekeeper', '121'],
  },
  {
    id: 'hearts',
    name: 'Hearts',
    tagline: 'Avoid the queen',
    blurb: 'Count hearts and the Queen of Spades. Lowest score wins when someone hits 100.',
    theme: 'hearts',
    keywords: ['hearts', 'tricks', 'queen', 'spades', 'moon', 'scorekeeper', 'avoid'],
  },
  {
    id: 'gin-rummy',
    name: 'Gin Rummy',
    tagline: 'First to 100',
    blurb: 'Knock or gin, count leftover deadwood, and watch for the undercut on the way to 100.',
    theme: 'gin-rummy',
    keywords: ['gin', 'rummy', 'knock', 'deadwood', 'undercut', 'cards', 'scorekeeper', '100'],
  },
  {
    id: 'farkle',
    name: 'Farkle',
    tagline: 'Bank 10,000',
    blurb: 'Bank scoring dice or farkle for zero. First to 10,000 takes the pot.',
    theme: 'farkle',
    keywords: ['farkle', 'dice', '10000', 'hot dice', 'bank', 'scorekeeper', 'ten thousand'],
  },
  {
    id: 'qwixx',
    name: 'Qwixx',
    tagline: 'Cross the rows',
    blurb: 'X the colored rows, lock them out, and subtract penalty marks. Highest pad wins.',
    theme: 'qwixx',
    keywords: ['qwixx', 'dice', 'rows', 'crosses', 'lockout', 'scorekeeper', 'red', 'yellow', 'green', 'blue'],
  },
  {
    id: 'monopoly-deal',
    name: 'Monopoly Deal',
    tagline: 'First to 3 sets',
    blurb: 'Complete property sets, optional cash points, and a crown for first to three — not the board game.',
    theme: 'monopoly-deal',
    keywords: ['monopoly', 'deal', 'cards', 'property', 'sets', 'rent', 'scorekeeper', 'cash'],
  },
  {
    id: 'sorry',
    name: 'Sorry!',
    tagline: 'Race all 4 home',
    blurb: 'Four pawns each. Slide, bump, and get every pawn Home first.',
    theme: 'sorry',
    keywords: ['sorry', 'board', 'pawns', 'home', 'slide', 'hasbro', 'scorekeeper'],
  },
  {
    id: 'ticket-to-ride',
    name: 'Ticket to Ride',
    tagline: 'Claim the rails',
    blurb: 'Add claimed routes, destination tickets, and the longest-route bonus. Highest total wins.',
    theme: 'ticket-to-ride',
    keywords: ['ticket', 'ride', 'train', 'routes', 'tickets', 'map', 'scorekeeper', 'longest'],
  },
  {
    id: 'sequence',
    name: 'Sequence',
    tagline: 'Make your sequences',
    blurb: 'Count rows of five. Need two for 3–6 players, or one for teams and two-player tables.',
    theme: 'sequence',
    keywords: ['sequence', 'chips', 'cards', 'board', 'teams', 'scorekeeper', 'five'],
  },
]

export function gameById(id: GameId): GameDefinition {
  const game = GAMES.find((entry) => entry.id === id)
  if (!game) {
    throw new Error(`Unknown game ${id}`)
  }
  return game
}

export function searchGames(query: string, games: GameDefinition[] = GAMES): GameDefinition[] {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) {
    return games
  }

  return games.filter((game) => {
    const haystack = [game.id, game.name, game.tagline, game.blurb, ...game.keywords].join(' ').toLowerCase()
    return tokens.every((token) => haystack.includes(token))
  })
}
