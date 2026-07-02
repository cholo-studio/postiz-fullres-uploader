import { expect, test } from 'vitest'
import { isAllowedType, mediaKind } from '@/lib/validation'

test('accepts a jpeg image', () => {
  expect(isAllowedType('image/jpeg')).toBe(true)
  expect(mediaKind('image/jpeg')).toBe('image')
})

test('accepts an mp4 video', () => {
  expect(isAllowedType('video/mp4')).toBe(true)
  expect(mediaKind('video/mp4')).toBe('video')
})

test('rejects an unsupported type', () => {
  expect(isAllowedType('application/pdf')).toBe(false)
  expect(mediaKind('application/pdf')).toBeNull()
})
