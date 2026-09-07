import { getHouseholdId } from './household.ts'
import { getSupabase, isSupabaseConfigured } from './supabase.ts'
import type { CloudKind, CloudRecord, GameId } from './types.ts'

export async function upsertCloudRecord(input: {
  id: string
  gameType: GameId
  kind: CloudKind
  payload: unknown
}): Promise<void> {
  if (import.meta.env.MODE === 'test') {
    return
  }
  const client = getSupabase()
  if (!client) {
    return
  }
  const householdId = getHouseholdId()
  const { error } = await client.from('game_night_records').upsert({
    id: input.id,
    household_id: householdId,
    game_type: input.gameType,
    kind: input.kind,
    payload: input.payload,
    updated_at: new Date().toISOString(),
  })
  if (error) {
    console.warn('Game Night sync failed', error.message)
  }
}

export async function deleteCloudRecord(id: string): Promise<void> {
  if (import.meta.env.MODE === 'test') {
    return
  }
  const client = getSupabase()
  if (!client) {
    return
  }
  const { error } = await client.from('game_night_records').delete().eq('id', id).eq('household_id', getHouseholdId())
  if (error) {
    console.warn('Game Night delete failed', error.message)
  }
}

export async function listCloudRecords(gameType: GameId, kind?: CloudKind): Promise<CloudRecord[]> {
  if (import.meta.env.MODE === 'test') {
    return []
  }
  const client = getSupabase()
  if (!client) {
    return []
  }
  let query = client
    .from('game_night_records')
    .select('*')
    .eq('household_id', getHouseholdId())
    .eq('game_type', gameType)
    .order('updated_at', { ascending: false })
  if (kind) {
    query = query.eq('kind', kind)
  }
  const { data, error } = await query
  if (error) {
    console.warn('Game Night list failed', error.message)
    return []
  }
  return (data ?? []) as CloudRecord[]
}

export function cloudAvailable(): boolean {
  return isSupabaseConfigured()
}
