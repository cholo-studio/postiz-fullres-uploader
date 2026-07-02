import { expect, test } from 'vitest'
import { thumbnailSize } from '@/lib/dimensions'

test('scales a large landscape image to max 400 on the long edge', () => {
  expect(thumbnailSize(4000, 3000)).toEqual({ width: 400, height: 300 })
})

test('scales a large portrait image to max 400 on the long edge', () => {
  expect(thumbnailSize(1080, 1920)).toEqual({ width: 225, height: 400 })
})

test('never upscales a small image', () => {
  expect(thumbnailSize(120, 80)).toEqual({ width: 120, height: 80 })
})
