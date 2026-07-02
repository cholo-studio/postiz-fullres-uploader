import { expect, test } from 'vitest'
import { addEntry, listEntries, HistoryEntry, HISTORY_KEY, HISTORY_LIMIT, KvLike } from '@/lib/history'

function fakeKv() {
  const store: Record<string, string[]> = {}
  const calls: string[] = []
  const kv: KvLike = {
    async lpush(key, value) { store[key] = [value, ...(store[key] ?? [])]; return store[key].length },
    async ltrim(key, start, stop) { calls.push(`ltrim ${start} ${stop}`); store[key] = (store[key] ?? []).slice(start, stop + 1); return 'OK' },
    async lrange(key, start, stop) { const a = store[key] ?? []; return stop === -1 ? a.slice(start) : a.slice(start, stop + 1) },
  }
  return { kv, store, calls }
}

const entry: HistoryEntry = {
  id: '1', filename: 'ceviche.jpg', type: 'image', sizeBytes: 1234,
  thumbnailUrl: 'https://blob/t.jpg', postizPath: 'https://cdn/ceviche.jpg',
  postizId: 'p1', uploadedAt: '2026-07-02T10:00:00.000Z',
}

test('addEntry pushes then trims to the limit', async () => {
  const { kv, calls } = fakeKv()
  await addEntry(entry, kv)
  expect(calls).toContain(`ltrim 0 ${HISTORY_LIMIT - 1}`)
})

test('listEntries returns newest-first parsed entries', async () => {
  const { kv } = fakeKv()
  await addEntry(entry, kv)
  await addEntry({ ...entry, id: '2', filename: 'lomo.jpg' }, kv)
  const list = await listEntries(kv)
  expect(list.map((e) => e.id)).toEqual(['2', '1'])
  expect(list[0].filename).toBe('lomo.jpg')
})

test('uses the shared history key', () => {
  expect(HISTORY_KEY).toBe('postiz-uploader:history')
})
