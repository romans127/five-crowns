import { PHASES, type PhaseId } from './types.ts'

export const RANK_5_TO_9 = 5
export const RANK_10_TO_Q = 10
export const RANK_K_OR_SKIP = 15
export const WILD_POINTS = 25

export function phaseById(id: PhaseId) {
  return PHASES.find((phase) => phase.id === id) ?? PHASES[0]
}

export function phaseLabel(phase: number): string {
  if (phase > 10) {
    return 'Finished'
  }
  const found = PHASES.find((entry) => entry.id === phase)
  return found ? `Phase ${found.id}: ${found.label}` : `Phase ${phase}`
}

export function leftoverHint(): string {
  return `5–9 = ${RANK_5_TO_9} · 10–Q = ${RANK_10_TO_Q} · K / Skip = ${RANK_K_OR_SKIP} · Wild = ${WILD_POINTS}`
}
