import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { createGame, setHandScore } from './game/engine.ts'
import { HISTORY_KEY, upsertHistory } from './game/history.ts'
import { STORAGE_KEY } from './game/storage.ts'
import { ACTIVE_KEY as UNO_ACTIVE_KEY, HISTORY_KEY as UNO_HISTORY_KEY } from './games/uno/persist.ts'
import { ACTIVE_KEY as YAHTZEE_ACTIVE_KEY, HISTORY_KEY as YAHTZEE_HISTORY_KEY } from './games/yahtzee/persist.ts'
import { ACTIVE_KEY as CRIBBAGE_ACTIVE_KEY, HISTORY_KEY as CRIBBAGE_HISTORY_KEY } from './games/cribbage/persist.ts'
import { ACTIVE_KEY as DEAL_ACTIVE_KEY, HISTORY_KEY as DEAL_HISTORY_KEY } from './games/monopoly-deal/persist.ts'
import { ACTIVE_KEY as SORRY_ACTIVE_KEY, HISTORY_KEY as SORRY_HISTORY_KEY } from './games/sorry/persist.ts'
import { ACTIVE_KEY as TTR_ACTIVE_KEY, HISTORY_KEY as TTR_HISTORY_KEY } from './games/ticket-to-ride/persist.ts'
import { ACTIVE_KEY as SEQUENCE_ACTIVE_KEY, HISTORY_KEY as SEQUENCE_HISTORY_KEY } from './games/sequence/persist.ts'
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
    localStorage.removeItem(UNO_ACTIVE_KEY)
    localStorage.removeItem(UNO_HISTORY_KEY)
    localStorage.removeItem(YAHTZEE_ACTIVE_KEY)
    localStorage.removeItem(YAHTZEE_HISTORY_KEY)
    localStorage.removeItem(CRIBBAGE_ACTIVE_KEY)
    localStorage.removeItem(CRIBBAGE_HISTORY_KEY)
    localStorage.removeItem(DEAL_ACTIVE_KEY)
    localStorage.removeItem(DEAL_HISTORY_KEY)
    localStorage.removeItem(SORRY_ACTIVE_KEY)
    localStorage.removeItem(SORRY_HISTORY_KEY)
    localStorage.removeItem(TTR_ACTIVE_KEY)
    localStorage.removeItem(TTR_HISTORY_KEY)
    localStorage.removeItem(SEQUENCE_ACTIVE_KEY)
    localStorage.removeItem(SEQUENCE_HISTORY_KEY)
  })

  it('starts on a game picker', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Game Night' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /kings go wild/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /complete every phase/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /first to 500/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /go for yahtzee/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /race to 121/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /avoid the queen/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /first to 100/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /bank 10,000/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cross the rows/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /first to 3 sets/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /race all 4 home/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /claim the rails/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /make your sequences/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /complete every phase/i }))
    expect(screen.getByRole('heading', { level: 1, name: 'Phase 10' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /all games/i }))
    expect(screen.getByRole('heading', { name: 'Game Night' })).toBeInTheDocument()
  })

  it('opens Uno from the picker', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /first to 500/i }))
    expect(screen.getByRole('heading', { level: 1, name: 'UNO' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /all games/i }))
    expect(screen.getByRole('heading', { name: 'Game Night' })).toBeInTheDocument()
  })

  it('opens Yahtzee from the picker', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /go for yahtzee/i }))
    expect(screen.getByRole('heading', { level: 1, name: 'Yahtzee' })).toBeInTheDocument()
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
    await user.type(screen.getByRole('searchbox', { name: /search games/i }), 'xyzzy-no-game')
    expect(screen.getByText(/no games match “xyzzy-no-game”/i)).toBeInTheDocument()
  })

  it('opens Cribbage from the picker', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /race to 121/i }))
    expect(screen.getByRole('heading', { level: 1, name: 'Cribbage' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /all games/i }))
    expect(screen.getByRole('heading', { name: 'Game Night' })).toBeInTheDocument()
  })

  it('opens family table settings from the picker', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /family table/i }))
    expect(screen.getByRole('heading', { name: 'Family table' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /back to game night/i }))
    expect(screen.getByRole('heading', { name: 'Game Night' })).toBeInTheDocument()
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

    expect(screen.getByRole('heading', { level: 1, name: 'Five Crowns' })).toBeInTheDocument()
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
    expect(screen.getByRole('heading', { level: 1, name: 'Past games' })).toBeInTheDocument()
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
    expect(screen.getByRole('heading', { level: 1, name: 'Hall of crowns' })).toBeInTheDocument()
    expect(screen.getByText(/no completed games yet/i)).toBeInTheDocument()
  })

  it('swipes back from setup to home', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openFiveCrowns(user)

    await user.click(screen.getByRole('button', { name: /deal a new game/i }))
    expect(screen.getByText(/who.*at the table/i)).toBeInTheDocument()

    swipeLeft(swipeBackShell())
    expect(screen.getByRole('heading', { level: 1, name: 'Five Crowns' })).toBeInTheDocument()
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
    expect(screen.getByRole('heading', { level: 1, name: 'Game detail' })).toBeInTheDocument()

    swipeLeft(swipeBackShell())
    expect(screen.getByRole('heading', { level: 1, name: 'Past games' })).toBeInTheDocument()
  })
})

describe('Uno scorekeeper', () => {
  beforeEach(() => {
    cleanup()
    localStorage.removeItem(UNO_ACTIVE_KEY)
    localStorage.removeItem(UNO_HISTORY_KEY)
  })

  async function openUno(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('button', { name: /first to 500/i }))
  }

  it('starts a game, records leftovers, and opens the rules', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openUno(user)

    expect(screen.getByRole('heading', { level: 1, name: 'UNO' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /deal a new game/i }))
    await user.type(screen.getByLabelText('Player 1 name'), 'Ryan')
    await user.type(screen.getByLabelText('Player 2 name'), 'Ada')
    await user.click(screen.getByRole('button', { name: /shuffle up and deal/i }))

    expect(screen.getByRole('heading', { name: /yell uno/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /ryan/i }))
    let pad = screen.getByRole('dialog', { name: /leftovers this hand/i })
    await user.click(within(pad).getByRole('button', { name: /went out · 0/i }))
    expect(screen.getByRole('button', { name: /ryan.*total 0/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /ada/i }))
    pad = screen.getByRole('dialog', { name: /leftovers this hand/i })
    await user.click(within(pad).getByRole('button', { name: '2' }))
    await user.click(within(pad).getByRole('button', { name: '0' }))
    await user.click(within(pad).getByRole('button', { name: /lock in 20/i }))
    expect(screen.getByRole('button', { name: /ada.*total 0/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ryan.*\+20 this hand/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Rules' }))
    expect(screen.getByRole('heading', { name: /how uno works/i })).toBeInTheDocument()
    expect(screen.getByText(/wild, wild draw four/i)).toBeInTheDocument()
    expect(screen.getByText(/first to 500 wins/i)).toBeInTheDocument()
  })
})

describe('Yahtzee scorekeeper', () => {
  beforeEach(() => {
    cleanup()
    localStorage.removeItem(YAHTZEE_ACTIVE_KEY)
    localStorage.removeItem(YAHTZEE_HISTORY_KEY)
  })

  async function openYahtzee(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('button', { name: /go for yahtzee/i }))
  }

  it('starts a game, records a category, and opens the rules', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openYahtzee(user)

    expect(screen.getByRole('heading', { level: 1, name: 'Yahtzee' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /start a new pad/i }))
    await user.type(screen.getByLabelText('Player 1 name'), 'Ryan')
    await user.type(screen.getByLabelText('Player 2 name'), 'Ada')
    await user.click(screen.getByRole('button', { name: /open the pad/i }))

    expect(screen.getByRole('heading', { name: /ryan/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /aces/i }))
    const pad = screen.getByRole('dialog', { name: /aces/i })
    await user.click(within(pad).getByRole('button', { name: '3' }))
    await user.click(within(pad).getByRole('button', { name: /lock in 3/i }))
    expect(screen.getByRole('button', { name: /aces/i })).toHaveTextContent('3')

    await user.click(screen.getByRole('button', { name: 'Rules' }))
    expect(screen.getByRole('heading', { name: /rules/i })).toBeInTheDocument()
    expect(screen.getByText(/how yahtzee works/i)).toBeInTheDocument()
    expect(screen.getByText(/63 or more/i)).toBeInTheDocument()
    expect(screen.getByText(/highest grand total wins/i)).toBeInTheDocument()
  })
})

describe('Cribbage scorekeeper', () => {
  beforeEach(() => {
    cleanup()
    localStorage.removeItem(CRIBBAGE_ACTIVE_KEY)
    localStorage.removeItem(CRIBBAGE_HISTORY_KEY)
  })

  it('starts a game, pegs a hand, and opens the rules', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /race to 121/i }))

    expect(screen.getByRole('heading', { level: 1, name: 'Cribbage' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /deal a new game/i }))
    await user.type(screen.getByLabelText('Player 1 name'), 'Ryan')
    await user.type(screen.getByLabelText('Player 2 name'), 'Ada')
    await user.click(screen.getByRole('button', { name: /cut for the deal/i }))

    expect(screen.getByRole('heading', { name: /peg this hand/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /ryan/i }))
    const pad = screen.getByRole('dialog', { name: /points this hand/i })
    await user.click(within(pad).getByRole('button', { name: '1' }))
    await user.click(within(pad).getByRole('button', { name: '6' }))
    await user.click(within(pad).getByRole('button', { name: /lock in 16/i }))
    expect(screen.getByRole('button', { name: /ryan/i })).toHaveTextContent('16')

    await user.click(screen.getByRole('button', { name: 'Rules' }))
    expect(screen.getByRole('heading', { name: /how cribbage works/i })).toBeInTheDocument()
    expect(screen.getByText(/first player to 121 wins/i)).toBeInTheDocument()
  })
})

describe('Monopoly Deal scorekeeper', () => {
  beforeEach(() => {
    cleanup()
    localStorage.removeItem(DEAL_ACTIVE_KEY)
    localStorage.removeItem(DEAL_HISTORY_KEY)
  })

  it('starts a game, records sets, and opens the rules', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /first to 3 sets/i }))

    expect(screen.getByRole('heading', { level: 1, name: 'Monopoly Deal' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /deal a new game/i }))
    await user.type(screen.getByLabelText('Player 1 name'), 'Ryan')
    await user.type(screen.getByLabelText('Player 2 name'), 'Ada')
    await user.click(screen.getByRole('button', { name: /deal the cards/i }))

    expect(screen.getByRole('heading', { name: /count the sets/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /ryan/i }))
    const pad = screen.getByRole('dialog', { name: /sets this deal/i })
    await user.click(within(pad).getByRole('button', { name: '2 sets' }))
    await user.click(within(pad).getByRole('button', { name: /lock in 2 sets/i }))
    expect(screen.getByRole('button', { name: /ryan/i })).toHaveTextContent('2')

    await user.click(screen.getByRole('button', { name: 'Rules' }))
    expect(screen.getByRole('heading', { name: /how monopoly deal works/i })).toBeInTheDocument()
    expect(screen.getByText(/first player to 3 complete property sets wins/i)).toBeInTheDocument()
  })
})

describe('Sorry scorekeeper', () => {
  beforeEach(() => {
    cleanup()
    localStorage.removeItem(SORRY_ACTIVE_KEY)
    localStorage.removeItem(SORRY_HISTORY_KEY)
  })

  it('starts a game, records pawns home, and opens the rules', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /race all 4 home/i }))

    expect(screen.getByRole('heading', { level: 1, name: 'Sorry!' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /start a new board/i }))
    await user.type(screen.getByLabelText('Player 1 name'), 'Ryan')
    await user.type(screen.getByLabelText('Player 2 name'), 'Ada')
    await user.click(screen.getByRole('button', { name: /start the race/i }))

    expect(screen.getByRole('heading', { name: /pawns home/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /ryan/i }))
    const pad = screen.getByRole('dialog', { name: /pawns home/i })
    await user.click(within(pad).getByRole('button', { name: '3' }))
    await user.click(within(pad).getByRole('button', { name: /lock in 3 home/i }))
    expect(screen.getByRole('button', { name: /ryan/i })).toHaveTextContent('3')

    await user.click(screen.getByRole('button', { name: 'Rules' }))
    expect(screen.getByRole('heading', { name: /how sorry! works/i })).toBeInTheDocument()
    expect(screen.getByText(/first to get all 4 home wins/i)).toBeInTheDocument()
  })
})

describe('Ticket to Ride scorekeeper', () => {
  beforeEach(() => {
    cleanup()
    localStorage.removeItem(TTR_ACTIVE_KEY)
    localStorage.removeItem(TTR_HISTORY_KEY)
  })

  it('starts a game, records a pad, and opens the rules', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /claim the rails/i }))

    expect(screen.getByRole('heading', { level: 1, name: 'Ticket to Ride' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /open the map/i }))
    await user.type(screen.getByLabelText('Player 1 name'), 'Ryan')
    await user.type(screen.getByLabelText('Player 2 name'), 'Ada')
    await user.click(screen.getByRole('button', { name: /deal the tickets/i }))

    expect(screen.getByRole('heading', { name: /tally the map/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /ryan/i }))
    const pad = screen.getByRole('dialog', { name: /points this map/i })
    await user.click(within(pad).getByRole('button', { name: '4' }))
    await user.click(within(pad).getByRole('button', { name: /lock in 4/i }))
    expect(screen.getByRole('button', { name: /ryan/i })).toHaveTextContent('4')

    await user.click(screen.getByRole('button', { name: 'Rules' }))
    expect(screen.getByRole('heading', { name: /how ticket to ride works/i })).toBeInTheDocument()
    expect(screen.getByText(/highest total wins/i)).toBeInTheDocument()
  })
})

describe('Sequence scorekeeper', () => {
  beforeEach(() => {
    cleanup()
    localStorage.removeItem(SEQUENCE_ACTIVE_KEY)
    localStorage.removeItem(SEQUENCE_HISTORY_KEY)
  })

  it('starts a game, records sequences, and opens the rules', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /make your sequences/i }))

    expect(screen.getByRole('heading', { level: 1, name: 'Sequence' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /set the table/i }))
    await user.type(screen.getByLabelText('Player 1 name'), 'Ryan')
    await user.type(screen.getByLabelText('Player 2 name'), 'Ada')
    await user.click(screen.getByRole('button', { name: /deal the cards/i }))

    expect(screen.getByRole('heading', { name: /count sequences/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /ryan/i }))
    const pad = screen.getByRole('dialog', { name: /sequences/i })
    await user.click(within(pad).getByRole('button', { name: '1' }))
    await user.click(within(pad).getByRole('button', { name: /lock in 1/i }))
    expect(screen.getByRole('button', { name: /ryan/i })).toHaveTextContent('1')

    await user.click(screen.getByRole('button', { name: 'Rules' }))
    expect(screen.getByRole('heading', { name: /how sequence works/i })).toBeInTheDocument()
    expect(screen.getByText(/need 2 for 3–6 players/i)).toBeInTheDocument()
  })
})
