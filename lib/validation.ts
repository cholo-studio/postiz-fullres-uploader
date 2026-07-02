export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/avif',
  'image/gif', 'image/bmp', 'image/tiff',
] as const

export const ALLOWED_VIDEO_TYPES = ['video/mp4'] as const

export function mediaKind(mime: string): 'image' | 'video' | null {
  if ((ALLOWED_IMAGE_TYPES as readonly string[]).includes(mime)) return 'image'
  if ((ALLOWED_VIDEO_TYPES as readonly string[]).includes(mime)) return 'video'
  return null
}

export function isAllowedType(mime: string): boolean {
  return mediaKind(mime) !== null
}
