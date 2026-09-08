import {
  MAX_PLAYERS,
  MAX_SEQUENCES,
  MIN_PLAYERS,
  OPEN_WIN_THRESHOLD,
  PLAYER_COLORS,
  TEAMS_WIN_THRESHOLD,
  type SequenceGame,
  type SequenceMode,
  type SequencePlayer,
  type SequenceScore,
} from './types.ts'

function newId(): string {
  return crypto.randomUUID()
}

function emptyScores(players: SequencePlayer[]): Record<string, SequenceScore> {
  return Object.fromEntries(players.map((player) => [player.id, { sequences: null } satisfies SequenceScore]))
}

export function sequencesNeeded(playerCount: number, mode: SequenceMode): number {
  if (mode === 'teams' || playerCount === 2) {
    return TEAMS_WIN_THRESHOLD
  }
  return OPEN_WIN_THRESHOLD
}

export function createGame(playerNames: string[], mode: SequenceMode = 'open'): SequenceGame {
  const names = playerNames.map((name) => name.trim()).filter(Boolean)
  if (names.length < MIN_PLAYERS || names.length > MAX_PLAYERS) {
    throw new Error(`Sequence needs ${MIN_PLAYERS}–${MAX_PLAYERS} players or teams`)
  }

  const players: SequencePlayer[] = names.map((name, index) => ({
    id: newId(),
    name,
    colorIndex: index % PLAYER_COLORS.length,
  }))

  return {
    id: newId(),
    createdAt: new Date().toISOString(),
    players,
    scores: emptyScores(players),
    status: 'playing',
    mode,
    winThreshold: sequencesNeeded(players.length, mode),
  }
}

export function clampSequences(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }
  return Math.min(MAX_SEQUENCES, Math.max(0, Math.round(value)))
}

export function setSequences(game: SequenceGame, playerId: string, sequences: number | null): SequenceGame {
  return {
    ...game,
    scores: {
      ...game.scores,
      [playerId]: { sequences: sequences === null ? null : clampSequences(sequences) },
    },
  }
}

export function scoresReady(game: SequenceGame): boolean {
  return game.players.every((player) => typeof game.scores[player.id]?.sequences === 'number')
}

export function playerSequences(game: SequenceGame, playerId: string): number {
  return game.scores[playerId]?.sequences ?? 0
}

export function playerTotal(game: SequenceGame, playerId: string): number {
  return playerSequences(game, playerId)
}

export function standings(game: SequenceGame): Array<{ player: SequencePlayer; sequences: number }> {
  return [...game.players]
    .map((player) => ({ player, sequences: playerSequences(game, player.id) }))
    .sort((a, b) => b.sequences - a.sequences || a.player.name.localeCompare(b.player.name))
}

export function winners(game: SequenceGame): SequencePlayer[] {
  const ranked = standings(game)
  if (ranked.length === 0) {
    return []
  }
  const reached = ranked.filter((row) => row.sequences >= game.winThreshold)
  const pool = reached.length > 0 ? reached : ranked
  const best = Math.max(...pool.map((row) => row.sequences))
  return pool.filter((row) => row.sequences === best).map((row) => row.player)
}

export function lastPlacePlayers(game: SequenceGame): SequencePlayer[] {
  const ranked = standings(game)
  const worst = ranked[ranked.length - 1]
  if (!worst) {
    return []
  }
  return ranked.filter((row) => row.sequences === worst.sequences).map((row) => row.player)
}

export function wouldFinish(game: SequenceGame): boolean {
  return game.players.some((player) => playerSequences(game, player.id) >= game.winThreshold)
}

export function canCallGame(game: SequenceGame): boolean {
  return game.status === 'playing' && game.players.some((player) => typeof game.scores[player.id]?.sequences === 'number')
}

export function finishGame(game: SequenceGame): SequenceGame {
  if (game.status === 'finished') {
    return game
  }
  if (!wouldFinish(game) && !canCallGame(game)) {
    return game
  }
  return { ...game, status: 'finished' }
}

export function playerColor(player: SequencePlayer): (typeof PLAYER_COLORS)[number] {
  return PLAYER_COLORS[player.colorIndex] ?? PLAYER_COLORS[0]
}
