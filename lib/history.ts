export interface HistoryEntry {
  id: string
  filename: string
  type: 'image' | 'video'
  sizeBytes: number
  thumbnailUrl: string
  postizPath: string
  postizId: string
  uploadedAt: string
}

export interface KvLike {
  lpush(key: string, value: string): Promise<number>
  ltrim(key: string, start: number, stop: number): Promise<unknown>
  lrange(key: string, start: number, stop: number): Promise<string[]>
}

export const HISTORY_KEY = 'postiz-uploader:history'
export const HISTORY_LIMIT = 200

export async function addEntry(entry: HistoryEntry, kv: KvLike): Promise<void> {
  await kv.lpush(HISTORY_KEY, JSON.stringify(entry))
  await kv.ltrim(HISTORY_KEY, 0, HISTORY_LIMIT - 1)
}

export async function listEntries(kv: KvLike): Promise<HistoryEntry[]> {
  const raw = await kv.lrange(HISTORY_KEY, 0, -1)
  return raw.map((r) => (typeof r === 'string' ? (JSON.parse(r) as HistoryEntry) : (r as HistoryEntry)))
}
