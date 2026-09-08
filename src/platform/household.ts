export const HOUSEHOLD_KEY = 'game-night:household'

export const TABLE_CODE_LENGTH = 6
/** Crockford-style alphabet — no I, O, 0, or 1. */
export const TABLE_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const SHORT_CODE_RE = /^[A-Z0-9]{6}$/

export const TABLE_ID_ERROR =
  'Enter a 6-character table code, or a full table ID from another phone.'

export type HouseholdStorage = Pick<Storage, 'getItem' | 'setItem'>

export type JoinTableResult =
  | { ok: true; id: string; switched: boolean }
  | { ok: false; error: string }

export function createTableCode(random: () => number = Math.random): string {
  let code = ''
  for (let i = 0; i < TABLE_CODE_LENGTH; i += 1) {
    const index = Math.floor(random() * TABLE_CODE_ALPHABET.length)
    code += TABLE_CODE_ALPHABET[index] ?? TABLE_CODE_ALPHABET[0]
  }
  return code
}

export function isUuidTableId(id: string): boolean {
  return UUID_RE.test(id)
}

export function isShortTableCode(id: string): boolean {
  return SHORT_CODE_RE.test(id.replace(/[\s-]/g, '').toUpperCase())
}

export function normalizeTableId(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) {
    return null
  }

  if (UUID_RE.test(trimmed)) {
    return trimmed.toLowerCase()
  }

  const hex = trimmed.replace(/[^0-9a-fA-F]/g, '')
  if (hex.length === 32) {
    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20),
    ]
      .join('-')
      .toLowerCase()
  }

  const code = trimmed.replace(/[\s-]/g, '').toUpperCase()
  if (SHORT_CODE_RE.test(code)) {
    return code
  }

  return null
}

/** Value to text or paste when joining — stored household id, not a second key. */
export function shareableTableId(id: string): string {
  return normalizeTableId(id) ?? id.trim()
}

export function formatTableId(id: string): string {
  const code = id.replace(/[\s-]/g, '').toUpperCase()
  if (code.length === TABLE_CODE_LENGTH && SHORT_CODE_RE.test(code) && !isUuidTableId(id)) {
    return `${code.slice(0, 3)} ${code.slice(3)}`
  }
  return id
}

export function displayTableLabel(id: string): string {
  if (isUuidTableId(id)) {
    return `${id.slice(0, 8).toUpperCase()}…`
  }
  return formatTableId(id)
}

export function peekHouseholdId(storage: HouseholdStorage = localStorage): string | null {
  const existing = storage.getItem(HOUSEHOLD_KEY)
  return existing && existing.trim() ? existing : null
}

export function getHouseholdId(storage: HouseholdStorage = localStorage): string {
  const existing = peekHouseholdId(storage)
  if (existing) {
    return existing
  }
  const created = createTableCode()
  storage.setItem(HOUSEHOLD_KEY, created)
  return created
}

export function pinNewTable(storage: HouseholdStorage = localStorage): string {
  const current = peekHouseholdId(storage)
  let created = createTableCode()
  if (created === current) {
    created = createTableCode()
  }
  storage.setItem(HOUSEHOLD_KEY, created)
  return created
}

export function joinTable(raw: string, storage: HouseholdStorage = localStorage): JoinTableResult {
  const normalized = normalizeTableId(raw)
  if (!normalized) {
    return { ok: false, error: TABLE_ID_ERROR }
  }
  const current = peekHouseholdId(storage)
  storage.setItem(HOUSEHOLD_KEY, normalized)
  return { ok: true, id: normalized, switched: Boolean(current && current !== normalized) }
}

export function wouldSwitchTable(raw: string, storage: HouseholdStorage = localStorage): boolean {
  const normalized = normalizeTableId(raw)
  const current = peekHouseholdId(storage)
  return Boolean(normalized && current && current !== normalized)
}
