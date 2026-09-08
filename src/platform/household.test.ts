import { describe, expect, it } from 'vitest'
import {
  HOUSEHOLD_KEY,
  TABLE_CODE_ALPHABET,
  TABLE_CODE_LENGTH,
  TABLE_ID_ERROR,
  createTableCode,
  displayTableLabel,
  formatTableId,
  getHouseholdId,
  isShortTableCode,
  isUuidTableId,
  joinTable,
  normalizeTableId,
  peekHouseholdId,
  pinNewTable,
  shareableTableId,
  wouldSwitchTable,
} from './household.ts'

function memoryStorage(initial: Record<string, string> = {}): Pick<Storage, 'getItem' | 'setItem'> {
  const map = new Map(Object.entries(initial))
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value)
    },
  }
}

const LEGACY_UUID = '9f3c1a2b-4d5e-678f-9012-3456789abcde'

describe('createTableCode', () => {
  it('builds a 6-character shareable code from the safe alphabet', () => {
    const code = createTableCode(() => 0)
    expect(code).toHaveLength(TABLE_CODE_LENGTH)
    expect(code).toBe(TABLE_CODE_ALPHABET[0]!.repeat(TABLE_CODE_LENGTH))
    expect([...createTableCode()].every((char) => TABLE_CODE_ALPHABET.includes(char))).toBe(true)
  })
})

describe('normalizeTableId', () => {
  it('accepts grouped or compact short codes', () => {
    expect(normalizeTableId('k7m 3pq')).toBe('K7M3PQ')
    expect(normalizeTableId('K7M-3PQ')).toBe('K7M3PQ')
    expect(normalizeTableId('  abc234  ')).toBe('ABC234')
  })

  it('accepts legacy UUID household ids with or without dashes', () => {
    expect(normalizeTableId(LEGACY_UUID.toUpperCase())).toBe(LEGACY_UUID)
    expect(normalizeTableId(LEGACY_UUID.replaceAll('-', ''))).toBe(LEGACY_UUID)
  })

  it('rejects empty or malformed ids', () => {
    expect(normalizeTableId('')).toBeNull()
    expect(normalizeTableId('K7M')).toBeNull()
    expect(normalizeTableId('not a table')).toBeNull()
  })
})

describe('format and display', () => {
  it('groups short codes and abbreviates legacy UUIDs', () => {
    expect(formatTableId('K7M3PQ')).toBe('K7M 3PQ')
    expect(formatTableId(LEGACY_UUID)).toBe(LEGACY_UUID)
    expect(displayTableLabel('K7M3PQ')).toBe('K7M 3PQ')
    expect(displayTableLabel(LEGACY_UUID)).toBe('9F3C1A2B…')
    expect(shareableTableId('k7m 3pq')).toBe('K7M3PQ')
    expect(isShortTableCode('K7M 3PQ')).toBe(true)
    expect(isUuidTableId(LEGACY_UUID)).toBe(true)
  })
})

describe('getHouseholdId', () => {
  it('creates a short table code when this device has no pin', () => {
    const storage = memoryStorage()
    const created = getHouseholdId(storage)
    expect(created).toHaveLength(TABLE_CODE_LENGTH)
    expect([...created].every((char) => TABLE_CODE_ALPHABET.includes(char))).toBe(true)
    expect(storage.getItem(HOUSEHOLD_KEY)).toBe(created)
    expect(getHouseholdId(storage)).toBe(created)
  })

  it('keeps an existing UUID pin so cloud rows stay attached', () => {
    const storage = memoryStorage({ [HOUSEHOLD_KEY]: LEGACY_UUID })
    expect(getHouseholdId(storage)).toBe(LEGACY_UUID)
    expect(peekHouseholdId(storage)).toBe(LEGACY_UUID)
  })
})

describe('join and switch', () => {
  it('pins a joined code and reports whether the table changed', () => {
    const storage = memoryStorage({ [HOUSEHOLD_KEY]: 'K7M3PQ' })
    expect(joinTable('k7m 3pq', storage)).toEqual({ ok: true, id: 'K7M3PQ', switched: false })
    expect(joinTable('ABC234', storage)).toEqual({ ok: true, id: 'ABC234', switched: true })
    expect(storage.getItem(HOUSEHOLD_KEY)).toBe('ABC234')
  })

  it('joins a legacy UUID without inventing a second key', () => {
    const storage = memoryStorage({ [HOUSEHOLD_KEY]: 'K7M3PQ' })
    expect(joinTable(LEGACY_UUID, storage)).toEqual({ ok: true, id: LEGACY_UUID, switched: true })
    expect(getHouseholdId(storage)).toBe(LEGACY_UUID)
  })

  it('rejects a bad join and leaves the pin alone', () => {
    const storage = memoryStorage({ [HOUSEHOLD_KEY]: 'K7M3PQ' })
    expect(joinTable('nope', storage)).toEqual({ ok: false, error: TABLE_ID_ERROR })
    expect(storage.getItem(HOUSEHOLD_KEY)).toBe('K7M3PQ')
  })

  it('creates a new pin and detects a pending switch', () => {
    const storage = memoryStorage({ [HOUSEHOLD_KEY]: 'K7M3PQ' })
    expect(wouldSwitchTable('ABC234', storage)).toBe(true)
    expect(wouldSwitchTable('k7m 3pq', storage)).toBe(false)
    const created = pinNewTable(storage)
    expect(created).not.toBe('K7M3PQ')
    expect(getHouseholdId(storage)).toBe(created)
  })
})
