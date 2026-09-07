export const HOUSEHOLD_KEY = 'game-night:household'

export function getHouseholdId(storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage): string {
  const existing = storage.getItem(HOUSEHOLD_KEY)
  if (existing) {
    return existing
  }
  const created = crypto.randomUUID()
  storage.setItem(HOUSEHOLD_KEY, created)
  return created
}
