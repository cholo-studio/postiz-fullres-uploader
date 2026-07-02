import { addEntry, HistoryEntry, KvLike } from '@/lib/history'
import type { uploadFromUrl as UploadFromUrl } from '@/lib/postiz'

export interface FinalizeInput {
  originalBlobUrl: string
  thumbnailBlobUrl: string
  filename: string
  type: 'image' | 'video'
  sizeBytes: number
}

export interface FinalizeDeps {
  apiKey: string
  apiBase?: string
  kv: KvLike
  deleteBlob: (url: string) => Promise<void>
  uploadFromUrl: typeof UploadFromUrl
  now: () => string
  newId: () => string
  fetchImpl?: typeof fetch
}

export async function finalizeUpload(input: FinalizeInput, deps: FinalizeDeps): Promise<HistoryEntry> {
  const uploaded = await deps.uploadFromUrl({
    apiKey: deps.apiKey, url: input.originalBlobUrl, apiBase: deps.apiBase, fetchImpl: deps.fetchImpl,
  })
  const entry: HistoryEntry = {
    id: deps.newId(),
    filename: input.filename,
    type: input.type,
    sizeBytes: input.sizeBytes,
    thumbnailUrl: input.thumbnailBlobUrl,
    postizPath: uploaded.path,
    postizId: uploaded.id,
    uploadedAt: deps.now(),
  }
  await addEntry(entry, deps.kv)
  try {
    await deps.deleteBlob(input.originalBlobUrl)
  } catch {
    // original blob cleanup failed — orphaned blob, non-fatal
  }
  return entry
}
