import { bonusNeeded, clampCategoryScore, UPPER_BONUS, UPPER_BONUS_THRESHOLD, YAHTZEE_BONUS, YAHTZEE_SCORE } from './rules.ts'
import {
  CATEGORY_COUNT,
  CATEGORY_IDS,
  LOWER_CATEGORY_IDS,
  MAX_PLAYERS,
  MAX_YAHTZEE_BONUSES,
  MIN_PLAYERS,
  PLAYER_COLORS,
  UPPER_CATEGORY_IDS,
  type CategoryId,
  type YahtzeeGame,
  type YahtzeePlayer,
  type YahtzeeScores,
} from './types.ts'

export type PlayerTotals = {
  upperSubtotal: number
  upperBonus: number
  upperTotal: number
  lowerSubtotal: number
  yahtzeeBonusPoints: number
  lowerTotal: number
  grandTotal: number
  filled: number
  bonusNeeded: number
}

function newId(): string {
  return crypto.randomUUID()
}

export function emptyScores(): YahtzeeScores {
  return {
    aces: null,
    twos: null,
    threes: null,
    fours: null,
    fives: null,
    sixes: null,
    threeKind: null,
    fourKind: null,
    fullHouse: null,
    smallStraight: null,
    largeStraight: null,
    yahtzee: null,
    chance: null,
  }
}

export function createGame(playerNames: string[]): YahtzeeGame {
  const names = playerNames.map((name) => name.trim()).filter(Boolean)
  if (names.length < MIN_PLAYERS || names.length > MAX_PLAYERS) {
    throw new Error(`Yahtzee needs ${MIN_PLAYERS}–${MAX_PLAYERS} players`)
  }

  const players: YahtzeePlayer[] = names.map((name, index) => ({
    id: newId(),
    name,
    colorIndex: index % PLAYER_COLORS.length,
    scores: emptyScores(),
    yahtzeeBonuses: 0,
  }))

  return {
    id: newId(),
    createdAt: new Date().toISOString(),
    players,
    status: 'playing',
  }
}

function replacePlayer(game: YahtzeeGame, playerId: string, next: YahtzeePlayer): YahtzeeGame {
  return {
    ...game,
    players: game.players.map((player) => (player.id === playerId ? next : player)),
  }
}

function maybeFinish(game: YahtzeeGame): YahtzeeGame {
  return {
    ...game,
    status: game.players.every((player) => scorecardComplete(player)) ? 'finished' : 'playing',
  }
}

export function setCategoryScore(
  game: YahtzeeGame,
  playerId: string,
  category: CategoryId,
  value: number | null,
): YahtzeeGame {
  const player = game.players.find((entry) => entry.id === playerId)
  if (!player) {
    return game
  }

  const score = value === null ? null : clampCategoryScore(category, value)
  const yahtzeeBonuses =
    category === 'yahtzee' && score !== YAHTZEE_SCORE ? 0 : player.yahtzeeBonuses

  return maybeFinish(
    replacePlayer(game, playerId, {
      ...player,
      scores: { ...player.scores, [category]: score },
      yahtzeeBonuses,
    }),
  )
}

export function setYahtzeeBonuses(game: YahtzeeGame, playerId: string, count: number): YahtzeeGame {
  const player = game.players.find((entry) => entry.id === playerId)
  if (!player) {
    return game
  }

  const allowed = player.scores.yahtzee === YAHTZEE_SCORE
  const next = allowed ? Math.min(MAX_YAHTZEE_BONUSES, Math.max(0, Math.round(count))) : 0

  return maybeFinish(replacePlayer(game, playerId, { ...player, yahtzeeBonuses: next }))
}

export function boxesFilled(player: YahtzeePlayer): number {
  return CATEGORY_IDS.filter((id) => typeof player.scores[id] === 'number').length
}

export function scorecardComplete(player: YahtzeePlayer): boolean {
  return boxesFilled(player) >= CATEGORY_COUNT
}

export function gameComplete(game: YahtzeeGame): boolean {
  return game.players.every((player) => scorecardComplete(player))
}

export function playerTotals(player: YahtzeePlayer): PlayerTotals {
  const upperSubtotal = UPPER_CATEGORY_IDS.reduce((sum, id) => {
    const score = player.scores[id]
    return sum + (typeof score === 'number' ? score : 0)
  }, 0)
  const upperBonus = upperSubtotal >= UPPER_BONUS_THRESHOLD ? UPPER_BONUS : 0
  const lowerSubtotal = LOWER_CATEGORY_IDS.reduce((sum, id) => {
    const score = player.scores[id]
    return sum + (typeof score === 'number' ? score : 0)
  }, 0)
  const yahtzeeBonusPoints = player.yahtzeeBonuses * YAHTZEE_BONUS
  const upperTotal = upperSubtotal + upperBonus
  const lowerTotal = lowerSubtotal + yahtzeeBonusPoints

  return {
    upperSubtotal,
    upperBonus,
    upperTotal,
    lowerSubtotal,
    yahtzeeBonusPoints,
    lowerTotal,
    grandTotal: upperTotal + lowerTotal,
    filled: boxesFilled(player),
    bonusNeeded: bonusNeeded(upperSubtotal),
  }
}

export function playerGrandTotal(game: YahtzeeGame, playerId: string): number {
  const player = game.players.find((entry) => entry.id === playerId)
  return player ? playerTotals(player).grandTotal : 0
}

export function standings(game: YahtzeeGame): Array<{ player: YahtzeePlayer; total: number }> {
  return [...game.players]
    .map((player) => ({ player, total: playerTotals(player).grandTotal }))
    .sort((a, b) => b.total - a.total || a.player.name.localeCompare(b.player.name))
}

export function winners(game: YahtzeeGame): YahtzeePlayer[] {
  const ranked = standings(game)
  const best = ranked[0]
  if (!best) {
    return []
  }
  return ranked.filter((row) => row.total === best.total).map((row) => row.player)
}

export function lastPlacePlayers(game: YahtzeeGame): YahtzeePlayer[] {
  const ranked = standings(game)
  const worst = ranked[ranked.length - 1]
  if (!worst) {
    return []
  }
  return ranked.filter((row) => row.total === worst.total).map((row) => row.player)
}

export function playerColor(player: YahtzeePlayer): (typeof PLAYER_COLORS)[number] {
  return PLAYER_COLORS[player.colorIndex] ?? PLAYER_COLORS[0]
}
