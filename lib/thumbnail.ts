import { thumbnailSize } from '@/lib/dimensions'

// Browser-only. Produces a small JPEG Blob preview for an image or video file.
export async function makeThumbnail(file: File): Promise<Blob> {
  const isVideo = file.type.startsWith('video/')
  const { bitmap, width, height } = isVideo
    ? await frameFromVideo(file)
    : await frameFromImage(file)
  const target = thumbnailSize(width, height)
  const canvas = document.createElement('canvas')
  canvas.width = target.width
  canvas.height = target.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap as CanvasImageSource, 0, 0, target.width, target.height)
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.8))
}

async function frameFromImage(file: File) {
  const bitmap = await createImageBitmap(file)
  return { bitmap, width: bitmap.width, height: bitmap.height }
}

async function frameFromVideo(file: File) {
  const url = URL.createObjectURL(file)
  const video = document.createElement('video')
  video.src = url
  video.muted = true
  await new Promise<void>((res, rej) => {
    video.onloadeddata = () => { video.currentTime = Math.min(0.1, video.duration || 0.1) }
    video.onseeked = () => res()
    video.onerror = () => rej(new Error('Video konnte nicht gelesen werden'))
  })
  const width = video.videoWidth
  const height = video.videoHeight
  const bitmap = await createImageBitmap(video)
  URL.revokeObjectURL(url)
  return { bitmap, width, height }
}
